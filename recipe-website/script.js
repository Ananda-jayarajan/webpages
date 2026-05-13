function searchRecipe() {
  const input = document.getElementById('searchInput');
  const value = input ? input.value.trim() : '';
  alert(value ? `Searching for: ${value}` : 'Type a recipe or ingredient first');
}
