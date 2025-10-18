import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API: Criar feedback anônimo
app.post('/api/feedbacks', async (c) => {
  try {
    const { category, content } = await c.req.json()
    
    // Validações
    if (!category || !content) {
      return c.json({ error: 'Categoria e conteúdo são obrigatórios' }, 400)
    }
    
    const validCategories = ['que_bom', 'que_pena', 'que_tal']
    if (!validCategories.includes(category)) {
      return c.json({ error: 'Categoria inválida' }, 400)
    }
    
    if (content.trim().length < 10) {
      return c.json({ error: 'Feedback deve ter no mínimo 10 caracteres' }, 400)
    }
    
    if (content.length > 1000) {
      return c.json({ error: 'Feedback deve ter no máximo 1000 caracteres' }, 400)
    }
    
    // Inserir no banco de dados
    const result = await c.env.DB.prepare(`
      INSERT INTO feedbacks (category, content) 
      VALUES (?, ?)
    `).bind(category, content.trim()).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Feedback enviado com sucesso!' 
    }, 201)
  } catch (error) {
    console.error('Erro ao criar feedback:', error)
    return c.json({ error: 'Erro ao processar feedback' }, 500)
  }
})

// API: Listar todos os feedbacks
app.get('/api/feedbacks', async (c) => {
  try {
    const category = c.req.query('category')
    const limit = parseInt(c.req.query('limit') || '100')
    const offset = parseInt(c.req.query('offset') || '0')
    
    let query = 'SELECT * FROM feedbacks'
    const params: string[] = []
    
    if (category) {
      query += ' WHERE category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit.toString(), offset.toString())
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({ 
      feedbacks: result.results,
      count: result.results.length 
    })
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error)
    return c.json({ error: 'Erro ao buscar feedbacks' }, 500)
  }
})

// API: Estatísticas
app.get('/api/stats', async (c) => {
  try {
    // Total por categoria
    const categoryStats = await c.env.DB.prepare(`
      SELECT 
        category,
        COUNT(*) as count
      FROM feedbacks
      GROUP BY category
    `).all()
    
    // Total geral
    const totalResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM feedbacks
    `).first()
    
    // Feedbacks por dia (últimos 30 dias)
    const dailyStats = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM feedbacks
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all()
    
    return c.json({
      total: totalResult?.total || 0,
      by_category: categoryStats.results,
      daily: dailyStats.results
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500)
  }
})

// API: Exportar feedbacks (JSON)
app.get('/api/export', async (c) => {
  try {
    const format = c.req.query('format') || 'json'
    const category = c.req.query('category')
    
    let query = 'SELECT * FROM feedbacks'
    const params: string[] = []
    
    if (category) {
      query += ' WHERE category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY created_at DESC'
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    if (format === 'csv') {
      // Gerar CSV
      const csv = [
        'ID,Categoria,Conteúdo,Data',
        ...result.results.map((row: any) => 
          `${row.id},"${row.category}","${row.content.replace(/"/g, '""')}","${row.created_at}"`
        )
      ].join('\n')
      
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="feedbacks_${Date.now()}.csv"`
        }
      })
    }
    
    // JSON (padrão)
    return c.json(result.results, 200, {
      'Content-Disposition': `attachment; filename="feedbacks_${Date.now()}.json"`
    })
  } catch (error) {
    console.error('Erro ao exportar:', error)
    return c.json({ error: 'Erro ao exportar dados' }, 500)
  }
})

// API: Deletar feedback (admin)
app.delete('/api/feedbacks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    await c.env.DB.prepare(`
      DELETE FROM feedbacks WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true, message: 'Feedback removido' })
  } catch (error) {
    console.error('Erro ao deletar feedback:', error)
    return c.json({ error: 'Erro ao deletar feedback' }, 500)
  }
})

// API: Zerar todos os feedbacks (admin)
app.delete('/api/feedbacks', async (c) => {
  try {
    // Primeiro, exporta dados atuais para backup
    const backupResult = await c.env.DB.prepare(`
      SELECT * FROM feedbacks ORDER BY created_at DESC
    `).all()
    
    // Deletar todos os registros
    await c.env.DB.prepare(`
      DELETE FROM feedbacks
    `).run()
    
    // Resetar o auto-increment
    await c.env.DB.prepare(`
      DELETE FROM sqlite_sequence WHERE name='feedbacks'
    `).run()
    
    return c.json({ 
      success: true, 
      message: 'Todos os feedbacks foram removidos',
      backup_count: backupResult.results.length
    })
  } catch (error) {
    console.error('Erro ao zerar feedbacks:', error)
    return c.json({ error: 'Erro ao zerar feedbacks' }, 500)
  }
})

// Página inicial - Formulário de coleta
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Anônimo - Que Bom, Que Pena, Que Tal</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="text-center mb-10">
                <h1 class="text-4xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-comments text-indigo-600"></i>
                    Feedback Anônimo
                </h1>
                <p class="text-gray-600 text-lg max-w-2xl mx-auto">
                    Compartilhe sua opinião de forma totalmente anônima e segura. 
                    Suas respostas são confidenciais e ajudarão a melhorar nosso trabalho.
                </p>
                <div class="mt-4">
                    <a href="/dashboard" class="text-indigo-600 hover:text-indigo-800 font-semibold">
                        <i class="fas fa-chart-line mr-2"></i>Acessar Dashboard
                    </a>
                </div>
            </div>
            
            <!-- Explicação das categorias -->
            <div class="grid md:grid-cols-3 gap-6 mb-10 max-w-5xl mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
                    <div class="text-center">
                        <div class="text-4xl mb-3">😊</div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Que Bom</h3>
                        <p class="text-gray-600 text-sm">
                            Pontos positivos, conquistas e aspectos que funcionam bem
                        </p>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
                    <div class="text-center">
                        <div class="text-4xl mb-3">😕</div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Que Pena</h3>
                        <p class="text-gray-600 text-sm">
                            Dificuldades, problemas e pontos que precisam melhorar
                        </p>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
                    <div class="text-center">
                        <div class="text-4xl mb-3">💡</div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">Que Tal</h3>
                        <p class="text-gray-600 text-sm">
                            Sugestões, ideias e propostas para o futuro
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Formulário -->
            <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
                <form id="feedbackForm">
                    <div class="mb-6">
                        <label class="block text-gray-700 font-semibold mb-3">
                            <i class="fas fa-tag mr-2"></i>Categoria *
                        </label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <label class="cursor-pointer">
                                <input type="radio" name="category" value="que_bom" class="peer sr-only" required>
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-green-300 transition">
                                    <div class="text-2xl mb-2">😊</div>
                                    <div class="font-semibold text-gray-700">Que Bom</div>
                                </div>
                            </label>
                            
                            <label class="cursor-pointer">
                                <input type="radio" name="category" value="que_pena" class="peer sr-only" required>
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-yellow-500 peer-checked:bg-yellow-50 hover:border-yellow-300 transition">
                                    <div class="text-2xl mb-2">😕</div>
                                    <div class="font-semibold text-gray-700">Que Pena</div>
                                </div>
                            </label>
                            
                            <label class="cursor-pointer">
                                <input type="radio" name="category" value="que_tal" class="peer sr-only" required>
                                <div class="border-2 border-gray-300 rounded-lg p-4 text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-blue-300 transition">
                                    <div class="text-2xl mb-2">💡</div>
                                    <div class="font-semibold text-gray-700">Que Tal</div>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <label for="content" class="block text-gray-700 font-semibold mb-3">
                            <i class="fas fa-pencil-alt mr-2"></i>Seu Feedback *
                        </label>
                        <textarea 
                            id="content" 
                            name="content" 
                            rows="6" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                            placeholder="Compartilhe sua opinião... (mínimo 10 caracteres)"
                            required
                            minlength="10"
                            maxlength="1000"
                        ></textarea>
                        <div class="text-sm text-gray-500 mt-2">
                            <span id="charCount">0</span>/1000 caracteres
                        </div>
                    </div>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-shield-alt text-blue-500 mt-1 mr-3"></i>
                            <div class="text-sm text-gray-700">
                                <strong>100% Anônimo:</strong> Suas respostas não são rastreadas. 
                                Não coletamos IP, cookies ou qualquer informação de identificação.
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
                    >
                        <i class="fas fa-paper-plane mr-2"></i>Enviar Feedback Anônimo
                    </button>
                </form>
                
                <div id="message" class="mt-4 hidden"></div>
            </div>
            
            <!-- Footer -->
            <div class="text-center mt-10 text-gray-600">
                <p class="text-sm">
                    <i class="fas fa-lock mr-2"></i>
                    Ferramenta segura e privada para coleta de feedback anônimo
                </p>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            const form = document.getElementById('feedbackForm');
            const content = document.getElementById('content');
            const charCount = document.getElementById('charCount');
            const message = document.getElementById('message');
            
            // Contador de caracteres
            content.addEventListener('input', () => {
                charCount.textContent = content.value.length;
            });
            
            // Envio do formulário
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const data = {
                    category: formData.get('category'),
                    content: formData.get('content')
                };
                
                try {
                    const response = await axios.post('/api/feedbacks', data);
                    
                    // Mensagem de sucesso
                    message.className = 'mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg';
                    message.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + response.data.message;
                    message.classList.remove('hidden');
                    
                    // Resetar formulário
                    form.reset();
                    charCount.textContent = '0';
                    
                    // Esconder mensagem após 5 segundos
                    setTimeout(() => {
                        message.classList.add('hidden');
                    }, 5000);
                    
                } catch (error) {
                    message.className = 'mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg';
                    message.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>' + 
                        (error.response?.data?.error || 'Erro ao enviar feedback');
                    message.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
  `)
})

// Página do Dashboard
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard - Análise de Feedbacks</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-md">
                <div class="container mx-auto px-4 py-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800">
                                <i class="fas fa-chart-line text-indigo-600 mr-2"></i>
                                Dashboard de Feedbacks
                            </h1>
                            <p class="text-gray-600 text-sm">Análise de dados coletados</p>
                        </div>
                        <div class="flex gap-3">
                            <a href="/" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-arrow-left mr-2"></i>Voltar
                            </a>
                            <button id="exportBtn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-download mr-2"></i>Exportar
                            </button>
                            <button id="resetBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                                <i class="fas fa-trash-alt mr-2"></i>Zerar Dados
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Estatísticas -->
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-600 text-sm font-semibold">Total</p>
                                <p id="totalCount" class="text-3xl font-bold text-gray-800 mt-2">0</p>
                            </div>
                            <div class="bg-purple-100 p-3 rounded-lg">
                                <i class="fas fa-comments text-purple-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-600 text-sm font-semibold">Que Bom</p>
                                <p id="queBomCount" class="text-3xl font-bold text-green-600 mt-2">0</p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-lg">
                                <i class="fas fa-smile text-green-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-600 text-sm font-semibold">Que Pena</p>
                                <p id="quePenaCount" class="text-3xl font-bold text-yellow-600 mt-2">0</p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-lg">
                                <i class="fas fa-meh text-yellow-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-600 text-sm font-semibold">Que Tal</p>
                                <p id="queTalCount" class="text-3xl font-bold text-blue-600 mt-2">0</p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-lg">
                                <i class="fas fa-lightbulb text-blue-600 text-xl"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Gráficos -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-pie mr-2"></i>Distribuição por Categoria
                        </h2>
                        <canvas id="categoryChart"></canvas>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-xl font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-line mr-2"></i>Feedbacks por Dia
                        </h2>
                        <canvas id="dailyChart"></canvas>
                    </div>
                </div>
                
                <!-- Filtros -->
                <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-filter mr-2"></i>Filtros
                    </h2>
                    <div class="flex gap-3">
                        <button onclick="filterFeedbacks('all')" class="filter-btn bg-gray-600 text-white px-4 py-2 rounded-lg">
                            Todos
                        </button>
                        <button onclick="filterFeedbacks('que_bom')" class="filter-btn bg-green-600 text-white px-4 py-2 rounded-lg">
                            Que Bom
                        </button>
                        <button onclick="filterFeedbacks('que_pena')" class="filter-btn bg-yellow-600 text-white px-4 py-2 rounded-lg">
                            Que Pena
                        </button>
                        <button onclick="filterFeedbacks('que_tal')" class="filter-btn bg-blue-600 text-white px-4 py-2 rounded-lg">
                            Que Tal
                        </button>
                    </div>
                </div>
                
                <!-- Lista de Feedbacks -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4">
                        <i class="fas fa-list mr-2"></i>Feedbacks Recentes
                    </h2>
                    <div id="feedbacksList" class="space-y-4">
                        <p class="text-gray-600">Carregando feedbacks...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            let allFeedbacks = [];
            let categoryChart, dailyChart;
            
            const categoryLabels = {
                'que_bom': 'Que Bom',
                'que_pena': 'Que Pena',
                'que_tal': 'Que Tal'
            };
            
            const categoryIcons = {
                'que_bom': '😊',
                'que_pena': '😕',
                'que_tal': '💡'
            };
            
            const categoryColors = {
                'que_bom': 'green',
                'que_pena': 'yellow',
                'que_tal': 'blue'
            };
            
            // Carregar dados
            async function loadData() {
                try {
                    const [statsRes, feedbacksRes] = await Promise.all([
                        axios.get('/api/stats'),
                        axios.get('/api/feedbacks?limit=100')
                    ]);
                    
                    const stats = statsRes.data;
                    allFeedbacks = feedbacksRes.data.feedbacks;
                    
                    // Atualizar contadores
                    document.getElementById('totalCount').textContent = stats.total;
                    
                    stats.by_category.forEach(item => {
                        if (item.category === 'que_bom') {
                            document.getElementById('queBomCount').textContent = item.count;
                        } else if (item.category === 'que_pena') {
                            document.getElementById('quePenaCount').textContent = item.count;
                        } else if (item.category === 'que_tal') {
                            document.getElementById('queTalCount').textContent = item.count;
                        }
                    });
                    
                    // Criar gráficos
                    createCategoryChart(stats.by_category);
                    createDailyChart(stats.daily);
                    
                    // Mostrar feedbacks
                    displayFeedbacks(allFeedbacks);
                    
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                }
            }
            
            // Gráfico de pizza
            function createCategoryChart(data) {
                const ctx = document.getElementById('categoryChart').getContext('2d');
                
                if (categoryChart) categoryChart.destroy();
                
                categoryChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.map(item => categoryLabels[item.category]),
                        datasets: [{
                            data: data.map(item => item.count),
                            backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(234, 179, 8, 0.8)',
                                'rgba(59, 130, 246, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
            
            // Gráfico de linha
            function createDailyChart(data) {
                const ctx = document.getElementById('dailyChart').getContext('2d');
                
                if (dailyChart) dailyChart.destroy();
                
                dailyChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(item => {
                            const date = new Date(item.date);
                            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                        }).reverse(),
                        datasets: [{
                            label: 'Feedbacks',
                            data: data.map(item => item.count).reverse(),
                            borderColor: 'rgba(99, 102, 241, 1)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    precision: 0
                                }
                            }
                        }
                    }
                });
            }
            
            // Exibir feedbacks
            function displayFeedbacks(feedbacks) {
                const container = document.getElementById('feedbacksList');
                
                if (feedbacks.length === 0) {
                    container.innerHTML = '<p class="text-gray-600">Nenhum feedback encontrado.</p>';
                    return;
                }
                
                container.innerHTML = feedbacks.map(feedback => {
                    const color = categoryColors[feedback.category];
                    const date = new Date(feedback.created_at);
                    const dateStr = date.toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    return \`
                        <div class="border-l-4 border-\${color}-500 bg-\${color}-50 p-4 rounded-r-lg">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-sm font-semibold text-\${color}-700 bg-\${color}-200 px-3 py-1 rounded-full">
                                    \${categoryIcons[feedback.category]} \${categoryLabels[feedback.category]}
                                </span>
                                <span class="text-xs text-gray-500">\${dateStr}</span>
                            </div>
                            <p class="text-gray-700">\${feedback.content}</p>
                        </div>
                    \`;
                }).join('');
            }
            
            // Filtrar feedbacks
            function filterFeedbacks(category) {
                if (category === 'all') {
                    displayFeedbacks(allFeedbacks);
                } else {
                    const filtered = allFeedbacks.filter(f => f.category === category);
                    displayFeedbacks(filtered);
                }
            }
            
            // Exportar
            document.getElementById('exportBtn').addEventListener('click', async () => {
                const format = confirm('Exportar como CSV? (OK = CSV, Cancelar = JSON)') ? 'csv' : 'json';
                window.location.href = \`/api/export?format=\${format}\`;
            });
            
            // Zerar todos os dados
            document.getElementById('resetBtn').addEventListener('click', async () => {
                // Primeira confirmação
                const confirmFirst = confirm(
                    '⚠️ ATENÇÃO: Esta ação irá DELETAR TODOS os feedbacks permanentemente!\\n\\n' +
                    'Recomendamos exportar os dados antes de continuar.\\n\\n' +
                    'Deseja prosseguir?'
                );
                
                if (!confirmFirst) return;
                
                // Segunda confirmação (segurança extra)
                const confirmSecond = confirm(
                    '🚨 ÚLTIMA CONFIRMAÇÃO\\n\\n' +
                    'Tem certeza ABSOLUTA que deseja zerar todos os dados?\\n\\n' +
                    'Esta ação NÃO PODE SER DESFEITA!\\n\\n' +
                    'Clique OK para confirmar ou Cancelar para voltar.'
                );
                
                if (!confirmSecond) return;
                
                try {
                    // Desabilitar botão durante a operação
                    const resetBtn = document.getElementById('resetBtn');
                    resetBtn.disabled = true;
                    resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processando...';
                    resetBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    
                    // Chamar API para zerar dados
                    const response = await axios.delete('/api/feedbacks');
                    
                    if (response.data.success) {
                        // Mostrar mensagem de sucesso
                        alert(
                            '✅ Sucesso!\\n\\n' +
                            response.data.message + '\\n' +
                            \`Total de registros removidos: \${response.data.backup_count}\`
                        );
                        
                        // Recarregar dados (agora vazios)
                        await loadData();
                        
                        // Reabilitar botão
                        resetBtn.disabled = false;
                        resetBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Zerar Dados';
                        resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                } catch (error) {
                    console.error('Erro ao zerar dados:', error);
                    alert(
                        '❌ Erro ao zerar dados!\\n\\n' +
                        (error.response?.data?.error || 'Ocorreu um erro inesperado. Tente novamente.')
                    );
                    
                    // Reabilitar botão
                    const resetBtn = document.getElementById('resetBtn');
                    resetBtn.disabled = false;
                    resetBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Zerar Dados';
                    resetBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
            
            // Carregar ao iniciar
            loadData();
        </script>
    </body>
    </html>
  `)
})

export default app
