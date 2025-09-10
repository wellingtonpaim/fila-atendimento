// Componente simples para testar se o problema está no Login
const TestComponent = () => {
    return (
        <div style={{ 
            padding: '50px', 
            backgroundColor: '#f0f0f0', 
            color: '#333',
            textAlign: 'center'
        }}>
            <h1>TESTE - Frontend Funcionando</h1>
            <p>Se você vê esta mensagem, o problema foi isolado no componente Login</p>
            <button onClick={() => console.log('Botão funcionando')}>
                Testar Console
            </button>
        </div>
    );
};

export default TestComponent;
