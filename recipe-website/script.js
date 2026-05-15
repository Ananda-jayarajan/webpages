function searchRecipe() {
  const input = document.getElementById('searchInput');
  const value = input ? input.value.trim() : '';
  alert(value ? `Searching for: ${value}` : 'Type a recipe or ingredient first');
}

document.getElementById("navbar").innerHTML = `
<header class="topbar">

    <a class="brand-logo" href="/webpages/recipe-website/index.html">
      <img src="/webpages/recipe-website/assets/icons/logo.png" alt="Anand's Recipe Logo">
    
      <div class="brand-text">
        <span>Anand's</span>
        <span>Recipe.</span>
      </div>
    </a>

  <nav class="navlinks">

    <div class="nav-item">
      <a href="/webpages/recipe-website/index.html">Home</a>
    </div>

    <div class="nav-item">
      <a href="/webpages/recipe-website/pages/breakfast/index.html">
        Breakfast
      </a>
    </div>

    <div class="nav-item">
      <a href="/webpages/recipe-website/pages/lunch/index.html">
        Lunch
      </a>

      <div class="dropdown">
        <a href="/webpages/recipe-website/pages/lunch/vegetarian/index.html">
          Vegetarian
        </a>

        <a href="/webpages/recipe-website/pages/lunch/non-vegetarian/index.html">
          Non-Vegetarian
        </a>
      </div>
    </div>

    <div class="nav-item">
      <a href="/webpages/recipe-website/pages/dinner/index.html">
        Dinner
      </a>
    </div>

    <div class="nav-item">
      <a href="/webpages/recipe-website/pages/snacks/index.html">
        Snacks
      </a>
    </div>

    <div class="nav-item">
      <a href="/webpages/recipe-website/pages/others/index.html">
        Others
      </a>

      <div class="dropdown">
        <a href="/webpages/recipe-website/pages/others/soups/index.html">
          Soups
        </a>
      </div>
    </div>

  </nav>

 </header>
`;
