let data = [];
let filteredData = [];
let currentPage = 1;

// Function to dynamically fetch and load data from JSON file
async function loadData() {
  try {
    const response = await fetch("/data.json"); 
    if (!response.ok) {
      throw new Error(`Failed to load data. Status: ${response.status}`);
    }
    const jsonData = await response.json();

    // Access the "papers" array inside the JSON data
    if (jsonData.papers && Array.isArray(jsonData.papers)) {
      data = jsonData.papers;
      filteredData = data;
      currentPage = 1; 
      filterData(); 
    } else {
      throw new Error("Data format is invalid. Expected an array under 'papers'.");
    }
  } catch (error) {
    console.error("Error loading data:", error);
    document.getElementById("card-container").innerHTML = `<p class="error">Failed to load data. Please check the console for details.</p>`;
  }
}

// Function to filter data based on input criteria
function filterData() {
  const title = document.getElementById("filter-title").value.toLowerCase();
  const minCitations = +document.getElementById("filter-citations").value || 0;
  const startYear = +document.getElementById("filter-start-year").value || 0;
  const endYear = +document.getElementById("filter-end-year").value || Infinity;
  const rowsPerPage = +document.getElementById("rows-per-page").value || 10;

  console.log("Title filter:", title);
  console.log("Minimum citations filter:", minCitations);
  console.log("Start year filter:", startYear);
  console.log("End year filter:", endYear);

  filteredData = data.filter(
    paper =>
      (!title || paper.title.toLowerCase().includes(title)) &&
      (!minCitations || paper.citation_count >= minCitations) &&
      (!startYear || new Date(paper.published_at).getFullYear() >= startYear) &&
      (!endYear || new Date(paper.published_at).getFullYear() <= endYear)
  );

  console.log("Filtered data:", filteredData);

  const maxPages = Math.ceil(filteredData.length / rowsPerPage);
  currentPage = Math.min(currentPage, maxPages);

  renderPage(rowsPerPage);
}

// Function to render the current page of data
function renderPage(rowsPerPage) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  const cardContainer = document.getElementById("card-container");
  if (pageData.length === 0) {
    cardContainer.innerHTML = `<p class="no-data">No data available for the given filters.</p>`;
    return;
  }

  cardContainer.innerHTML = pageData
    .map(
      paper => `
      <div class="card">
        <h2>${paper.title}</h2>
        <p><strong>Authors:</strong> ${paper.authors}</p>
        <p><strong>Year:</strong> ${new Date(paper.published_at).getFullYear()}</p>
        <p><strong>Citations:</strong> ${paper.citation_count}</p>
        <p><strong>Venue:</strong> ${paper.journal}</p>
        <p class="description">
          ${paper.abstract.substring(0, 100)}...
          <span class="dots">...</span>
          <span class="more-text hidden">${paper.abstract.substring(100)}</span>
        </p>
        <button class="read-more-btn">Read More</button>
      </div>`
    )
    .join("");

  addReadMoreListeners();
}

// Function to toggle "Read More" and "Read Less"
function addReadMoreListeners() {
  const buttons = document.querySelectorAll(".read-more-btn");
  buttons.forEach(btn =>
    btn.addEventListener("click", e => {
      const card = e.target.parentElement;
      const dots = card.querySelector(".dots");
      const moreText = card.querySelector(".more-text");

      if (dots.classList.contains("hidden")) {
        dots.classList.remove("hidden");
        moreText.classList.add("hidden");
        btn.textContent = "Read More";
      } else {
        dots.classList.add("hidden");
        moreText.classList.remove("hidden");
        btn.textContent = "Read Less";
      }
    })
  );
}

//  event listeners to filter inputs
["filter-title", "filter-citations", "filter-start-year", "filter-end-year"].forEach(id => {
  document.getElementById(id).addEventListener("input", filterData);
});

// Event listeners for various actions
document.getElementById("clear-filters-btn").addEventListener("click", () => {
  document.getElementById("filter-title").value = "";
  document.getElementById("filter-citations").value = "";
  document.getElementById("filter-start-year").value = "";
  document.getElementById("filter-end-year").value = "";
  filterData();
});

document.getElementById("export-btn").addEventListener("click", () => {
  if (filteredData.length > 0) {
    const blob = new Blob([JSON.stringify(filteredData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_data.json";
    a.click();
    URL.revokeObjectURL(url);
  } else {
    alert("No data available to export.");
  }
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    const rowsPerPage = +document.getElementById("rows-per-page").value || 10;
    renderPage(rowsPerPage);
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  const rowsPerPage = +document.getElementById("rows-per-page").value || 10;
  const maxPages = Math.ceil(filteredData.length / rowsPerPage);
  if (currentPage < maxPages) {
    currentPage++;
    renderPage(rowsPerPage);
  }
});

document.getElementById("rows-per-page").addEventListener("change", () => {
  currentPage = 1;
  filterData();
});

// Load initial data on page load
loadData();
