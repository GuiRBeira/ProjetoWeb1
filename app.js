// app.js - Sistema de Perguntas e Respostas com TensorFlow.js QnA

// Variável para armazenar o modelo QnA
let qnaModel;

// Elementos da interface
const contextTextarea = document.getElementById('context');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('ask-btn');
const answerDiv = document.getElementById('answer');

// Carrega o modelo QnA quando a página é carregada
async function loadQnAModel() {
    try {
        // Mostra estado de carregamento
        answerDiv.innerHTML = "Carregando modelo de QnA... <span class='loading'></span>";
        
        // Carrega o modelo diretamente do tfjs-models/qna
        qnaModel = await qna.load();
        
        // Atualiza a interface quando o modelo estiver pronto
        answerDiv.innerHTML = `
            <p>Modelo QnA carregado com sucesso!</p>
            <p>Digite um texto no campo de contexto e faça sua pergunta.</p>
        `;
        
        console.log('Modelo QnA carregado:', qnaModel);
    } catch (error) {
        // Trata erros de carregamento do modelo
        const errorMessage = `Falha ao carregar o modelo QnA: ${error.message}`;
        answerDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
        console.error(errorMessage, error);
    }
}

// Processa a pergunta do usuário contra o contexto fornecido
async function processQuestion() {
    // Obtém os valores dos campos
    const context = contextTextarea.value.trim();
    const question = questionInput.value.trim();
    
    // Validações básicas
    if (!context) {
        answerDiv.innerHTML = '<p class="error">Por favor, insira um texto de contexto.</p>';
        return;
    }
    
    if (!question) {
        answerDiv.innerHTML = '<p class="error">Por favor, digite uma pergunta.</p>';
        return;
    }
    
    // Verifica se o modelo foi carregado
    if (!qnaModel) {
        answerDiv.innerHTML = '<p class="error">O modelo QnA ainda não foi carregado. Aguarde...</p>';
        return;
    }
    
    // Mostra estado de processamento
    answerDiv.innerHTML = "Processando sua pergunta... <span class='loading'></span>";
    
    try {
        // Mede o tempo de processamento
        const startTime = performance.now();
        
        // Usa o modelo QnA para encontrar respostas
        const answers = await qnaModel.findAnswers(question, context);
        
        const endTime = performance.now();
        const processingTime = ((endTime - startTime)/1000).toFixed(2);
        
        // Exibe os resultados
        displayAnswers(question, answers, processingTime);
        
        // Log para debug
        console.log('Pergunta:', question);
        console.log('Respostas encontradas:', answers);
        console.log(`Tempo de processamento: ${processingTime} segundos`);
    } catch (error) {
        // Trata erros durante o processamento
        const errorMessage = `Erro ao processar a pergunta: ${error.message}`;
        answerDiv.innerHTML = `<p class="error">${errorMessage}</p>`;
        console.error(errorMessage, error);
    }
}

// Exibe as respostas na interface
function displayAnswers(question, answers, processingTime) {
    if (!answers || answers.length === 0) {
        answerDiv.innerHTML = `
            <h3>Nenhuma resposta encontrada</h3>
            <p>O modelo não conseguiu encontrar uma resposta para sua pergunta no texto fornecido.</p>
            <p><strong>Dicas:</strong></p>
            <ul>
                <li>Verifique se a pergunta está relacionada ao contexto</li>
                <li>Tente reformular sua pergunta</li>
                <li>Forneça um contexto mais detalhado</li>
            </ul>
            <p class="processing-time">Processado em ${processingTime} segundos</p>
        `;
        return;
    }
    
    // Cria o HTML para mostrar as respostas
    let html = `
        <h3>Respostas para: "${question}"</h3>
        <p class="processing-time">Processado em ${processingTime} segundos</p>
    `;
    
    // Adiciona cada resposta encontrada
    answers.forEach((answer, index) => {
        html += `
            <div class="answer">
                <p><strong>Resposta ${index + 1}:</strong> ${answer.text}</p>
                <p class="confidence">Confiança: ${(answer.score * 100).toFixed(2)}%</p>
            </div>
        `;
    });
    
    // Adiciona dicas adicionais
    html += `
        <div class="tips">
            <p><strong>Dicas para melhorar os resultados:</strong></p>
            <ul>
                <li>Perguntas mais específicas tendem a ter melhores respostas</li>
                <li>Contextos mais longos e detalhados ajudam o modelo</li>
                <li>Evite perguntas subjetivas ou de opinião</li>
            </ul>
        </div>
    `;
    
    answerDiv.innerHTML = html;
}

// Configura os event listeners
function setupEventListeners() {
    // Botão de perguntar
    askButton.addEventListener('click', processQuestion);
    
    // Tecla Enter no campo de pergunta
    questionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processQuestion();
        }
    });
    
    // Limpa a resposta quando o contexto ou pergunta é alterada
    contextTextarea.addEventListener('input', () => {
        if (answerDiv.innerHTML && !answerDiv.innerHTML.includes('Modelo QnA carregado')) {
            answerDiv.innerHTML = '<p>O contexto foi alterado. Faça uma nova pergunta.</p>';
        }
    });
    
    questionInput.addEventListener('input', () => {
        if (answerDiv.innerHTML && !answerDiv.innerHTML.includes('Modelo QnA carregado')) {
            answerDiv.innerHTML = '<p>A pergunta foi alterada. Clique em "Perguntar" novamente.</p>';
        }
    });
}

// Inicializa a aplicação quando a página carrega
function init() {
    setupEventListeners();
    loadQnAModel();
}

// Aguarda o DOM estar pronto para iniciar
document.addEventListener('DOMContentLoaded', init);