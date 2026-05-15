function searchRecipe() {
  const input = document.getElementById('searchInput');
  const value = input ? input.value.trim() : '';
  alert(value ? `Searching for: ${value}` : 'Type a recipe or ingredient first');
}

const navbar = document.getElementById("navbar");

if (navbar) {
  navbar.innerHTML = `
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

        <div class="dropdown">
          <a href="/webpages/recipe-website/pages/home/featured-recipes/index.html">Featured Recipes</a>
          <a href="/webpages/recipe-website/pages/home/latest-recipes/index.html">Latest Recipes</a>
          <a href="/webpages/recipe-website/pages/home/recipe-collections/index.html">Recipe Collections</a>
        </div>
      </div>

      <div class="nav-item">
        <a href="/webpages/recipe-website/pages/breakfast/index.html">Breakfast</a>

        <div class="dropdown">
        
          <a href="/webpages/recipe-website/pages/breakfast/breakfast-eggs/index.html">Breakfast Eggs</a>
          <a href="/webpages/recipe-website/pages/breakfast/smoothies/index.html">Smoothies</a>
          <a href="/webpages/recipe-website/pages/breakfast/breakfast-bowls/index.html">Breakfast Bowls</a>
          <a href="/webpages/recipe-website/pages/breakfast/south-indian-breakfast/index.html">South Indian Breakfast</a>
        </div>
      </div>

      <div class="nav-item">
        <a href="/webpages/recipe-website/pages/lunch/index.html">Lunch</a>

        <div class="dropdown">
          <a href="/webpages/recipe-website/pages/lunch/vegetarian/index.html">Vegetarian dishes</a>
          <a href="/webpages/recipe-website/pages/lunch/non-vegetarian/index.html">Non-Vegetarian dishes</a>
          <a class="see-more" href="/webpages/recipe-website/pages/lunch/index.html">See More</a>
        </div>
      </div>

      <div class="nav-item">
        <a href="/webpages/recipe-website/pages/dinner/index.html">Dinner</a>

        <div class="dropdown">
          <a href="/webpages/recipe-website/pages/dinner/chicken-dinners/index.html">Chicken Dinners</a>
          <a href="/webpages/recipe-website/pages/dinner/pasta-dinners/index.html">Pasta Dinners</a>
          <a href="/webpages/recipe-website/pages/dinner/vegetarian-dinners/index.html">Vegetarian Dinners</a>
          <a href="/webpages/recipe-website/pages/dinner/one-pot-meals/index.html">One-Pot Meals</a>
          <a href="/webpages/recipe-website/pages/dinner/quick-dinners/index.html">Quick Dinners</a>
          <a class="see-more" href="/webpages/recipe-website/pages/dinner/index.html">See More</a>
        </div>
      </div>

      <div class="nav-item">
        <a href="/webpages/recipe-website/pages/snacks/index.html">Snacks</a>

        <div class="dropdown">
          <a href="/webpages/recipe-website/pages/snacks/healthy-snacks/index.html">Healthy Snacks</a>
          <a class="see-more" href="/webpages/recipe-website/pages/snacks/index.html">See More</a>
        </div>
      </div>

      <div class="nav-item">
        <a href="/webpages/recipe-website/pages/others/index.html">Others</a>

        <div class="dropdown">
          <a href="/webpages/recipe-website/pages/others/soups/index.html">Soups</a>
          <a class="see-more" href="/webpages/recipe-website/pages/others/index.html">See More</a>
        </div>
      </div>

    </nav>

  </header>
  `;
}
