# Sindrome Games - Linktree Premium

Este é um site de links (estilo Linktree) ultra-moderno, profissional e otimizado, criado especialmente para o canal **Sindrome Games**. O projeto foi desenvolvido com foco em performance, design gamer e interatividade.

## 🚀 Funcionalidades

- **Design Premium**: Interface baseada em glassmorphism com tema escuro.
- **Partículas Interativas**: Fundo animado em Canvas que reage ao mouse e toque.
- **Animações Fluidas**: Microinterações, efeitos de hover, entrada suave e ripple effect.
- **PWA Ready**: Manifest.json incluso para instalação como aplicativo.
- **SEO Otimizado**: Meta tags completas, Open Graph, Twitter Cards, robots.txt e sitemap.xml.
- **Web Share API**: Botão nativo de compartilhamento.
- **Performance**: 60 FPS estável, sem frameworks pesados, apenas HTML/CSS/JS puro.

## 🛠️ Como Personalizar

### 1. Alterar Foto de Perfil
Substitua o arquivo em `assets/img/avatar.png` por sua nova imagem (mantenha o nome ou atualize no `index.html`).

### 2. Alterar Nome e Bio
No arquivo `index.html`, localize as linhas:
```html
<h1 class="profile-name">Sindrome Games</h1>
<p class="profile-bio">Explorando o universo dos games com humor e gameplay.</p>
```

### 3. Adicionar/Remover Links
No `index.html`, dentro da `<main class="links-container">`, você pode duplicar ou remover os blocos `<a class="link-card">`. 
Para mudar o ícone, altere o atributo `data-lucide` (veja opções em [lucide.dev](https://lucide.dev)).

### 4. Alterar Cores
No arquivo `assets/css/style.css`, altere as variáveis no `:root`:
```css
--accent-color: #6366f1; /* Cor principal dos ícones e botões */
--bg-color: #050505;     /* Cor de fundo */
```

## 📦 Hospedagem no GitHub Pages

1. Crie um novo repositório no GitHub.
2. Faça o upload de todos os arquivos desta pasta.
3. Vá em **Settings** > **Pages**.
4. Em **Branch**, selecione `main` (ou `master`) e a pasta `/(root)`.
5. Clique em **Save**. Seu site estará no ar em instantes!

---

Desenvolvido com foco em excelência para **Sindrome Games**.
