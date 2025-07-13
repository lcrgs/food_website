// Stepper logic for Meal Planner wizard UI (progressive reveal, all steps editable, multiple selection)

document.addEventListener("DOMContentLoaded", () => {
  // Step elements
  const step1 = document.querySelector(".step-1");
  const step2 = document.querySelector(".step-2");
  const step3 = document.querySelector(".step-3");
  const step4 = document.querySelector(".step-4");

  // Button group containers
  const restrictionsBtnsContainer = document.getElementById("restrictionsBtns");
  const ingredientsBtnsContainer = document.getElementById("ingredientsBtns");
  const preferencesBtnsContainer = document.getElementById("preferencesBtns");

  // Step 1: Days
  const daysInput = document.getElementById("daysInput");
  let daysValue = null;

  // Step 2: Restrictions (multiple)
  let restrictionsBtns = [];
  let restrictionsValue = [];

  // Step 3: Ingredients (multiple)
  let ingredientsBtns = [];
  let ingredientsValue = [];

  // Step 4: Preferences (multiple)
  let preferencesBtns = [];
  const generateBtn = document.getElementById("generateBtn");
  let preferencesValue = [];

  // Hide all steps except the first on load
  step2.style.display = "none";
  step3.style.display = "none";
  step4.style.display = "none";

  // Fetch tags and render buttons dynamically
  async function fetchTags() {
    const corsProxy = "https://corsproxy.io/?";
    const webAppUrl =
      corsProxy +
      encodeURIComponent(
        "https://script.google.com/macros/s/AKfycbwA7R0GYMao0Os9_-5kwkQCONGzPwwRDhTM7nN3QMztOv0XtKPnEXwpjEvAmVfa6qgw/exec?type=tag"
      );
    const res = await fetch(webAppUrl);
    return await res.json(); // [{tag, categoria}]
  }

  function createBtn(tag, btnClass) {
    const btn = document.createElement("button");
    btn.className = `btn ${btnClass}`;
    btn.dataset.value = tag;
    // Add icon for restriction buttons
    if (btnClass === "restriction-btn") {
      let iconName = null;
      if (tag === "vegan") iconName = "sprout";
      if (tag === "vegetarian") iconName = "leaf";
      if (tag === "gluten-free") iconName = "wheat-off";
      if (iconName) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", iconName);
        icon.className = "dish-tag-icon";
        btn.appendChild(icon);
      }
    }
    // Add label as text node (so icon and label both show)
    const label =
      tag === "none"
        ? "No"
        : tag.replace(/\b\w/g, (l) => l.toUpperCase()).replace(/-/g, " ");
    btn.appendChild(document.createTextNode(" " + label));
    return btn;
  }

  async function renderTagButtons() {
    const tags = await fetchTags();
    // Clear containers
    restrictionsBtnsContainer.innerHTML = "";
    ingredientsBtnsContainer.innerHTML = "";
    preferencesBtnsContainer.innerHTML = "";
    // Restrictions
    tags
      .filter((t) => t.categoria === "restricao")
      .forEach((t) => {
        const btn = createBtn(t.tag, "restriction-btn");
        restrictionsBtnsContainer.appendChild(btn);
      });
    restrictionsBtnsContainer.appendChild(createBtn("none", "restriction-btn"));
    // Ingredients
    tags
      .filter((t) => t.categoria === "ingrediente")
      .forEach((t) => {
        const btn = createBtn(t.tag, "ingredient-btn");
        ingredientsBtnsContainer.appendChild(btn);
      });
    ingredientsBtnsContainer.appendChild(createBtn("none", "ingredient-btn"));
    // Preferences
    tags
      .filter((t) => t.categoria === "preferencia")
      .forEach((t) => {
        const btn = createBtn(t.tag, "preference-btn");
        preferencesBtnsContainer.appendChild(btn);
      });
    preferencesBtnsContainer.appendChild(createBtn("none", "preference-btn"));
    // Update btn node lists
    restrictionsBtns =
      restrictionsBtnsContainer.querySelectorAll(".restriction-btn");
    ingredientsBtns =
      ingredientsBtnsContainer.querySelectorAll(".ingredient-btn");
    preferencesBtns =
      preferencesBtnsContainer.querySelectorAll(".preference-btn");
    // Attach event listeners as before
    attachBtnListeners();
    // Render Lucide icons for restriction buttons
    if (window.lucide) {
      lucide.createIcons();
      setTimeout(() => {
        lucide.createIcons();
        console.log("Lucide icons rendered for restriction buttons");
      }, 0);
    }
  }

  function attachBtnListeners() {
    // Step 2 logic (multiple selection)
    restrictionsBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        if (value === "none") {
          restrictionsBtns.forEach((b) =>
            b.classList.remove("selected", "faded")
          );
          btn.classList.add("selected");
          restrictionsValue = ["none"];
        } else {
          const noneBtn = Array.from(restrictionsBtns).find(
            (b) => b.dataset.value === "none"
          );
          noneBtn.classList.remove("selected");
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!restrictionsValue.includes(value))
              restrictionsValue.push(value);
          } else {
            restrictionsValue = restrictionsValue.filter((v) => v !== value);
          }
          if (restrictionsValue.length === 0) {
            noneBtn.classList.add("selected");
            restrictionsValue = ["none"];
          } else {
            restrictionsValue = restrictionsValue.filter((v) => v !== "none");
          }
        }
        // Fading logic for restrictions
        if (
          restrictionsValue.length > 0 &&
          !restrictionsValue.includes("none")
        ) {
          restrictionsBtns.forEach((b) => {
            if (!b.classList.contains("selected")) {
              b.classList.add("faded");
            } else {
              b.classList.remove("faded");
            }
          });
        } else {
          restrictionsBtns.forEach((b) => b.classList.remove("faded"));
        }
        step3.style.display = "flex";
        updateIngredientOptions();
        checkShowGenerate();
      });
    });
    // Step 3 logic (multiple selection)
    ingredientsBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        if (value === "none") {
          ingredientsBtns.forEach((b) =>
            b.classList.remove("selected", "faded")
          );
          btn.classList.add("selected");
          ingredientsValue = ["none"];
        } else {
          const noneBtn = Array.from(ingredientsBtns).find(
            (b) => b.dataset.value === "none"
          );
          noneBtn.classList.remove("selected");
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!ingredientsValue.includes(value)) ingredientsValue.push(value);
          } else {
            ingredientsValue = ingredientsValue.filter((v) => v !== value);
          }
          if (ingredientsValue.length === 0) {
            noneBtn.classList.add("selected");
            ingredientsValue = ["none"];
          } else {
            ingredientsValue = ingredientsValue.filter((v) => v !== "none");
          }
        }
        // Fading logic for ingredients
        if (ingredientsValue.length > 0 && !ingredientsValue.includes("none")) {
          ingredientsBtns.forEach((b) => {
            if (!b.classList.contains("selected")) {
              b.classList.add("faded");
            } else {
              b.classList.remove("faded");
            }
          });
        } else {
          ingredientsBtns.forEach((b) => b.classList.remove("faded"));
        }
        step4.style.display = "flex";
        checkShowGenerate();
      });
    });
    // Step 4 logic (multiple selection)
    preferencesBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.dataset.value;
        if (value === "none") {
          preferencesBtns.forEach((b) =>
            b.classList.remove("selected", "faded")
          );
          btn.classList.add("selected");
          preferencesValue = ["none"];
        } else {
          const noneBtn = Array.from(preferencesBtns).find(
            (b) => b.dataset.value === "none"
          );
          noneBtn.classList.remove("selected");
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!preferencesValue.includes(value)) preferencesValue.push(value);
          } else {
            preferencesValue = preferencesValue.filter((v) => v !== value);
          }
          if (preferencesValue.length === 0) {
            noneBtn.classList.add("selected");
            preferencesValue = ["none"];
          } else {
            preferencesValue = preferencesValue.filter((v) => v !== "none");
          }
        }
        // Fading logic for preferences
        if (preferencesValue.length > 0 && !preferencesValue.includes("none")) {
          preferencesBtns.forEach((b) => {
            if (!b.classList.contains("selected")) {
              b.classList.add("faded");
            } else {
              b.classList.remove("faded");
            }
          });
        } else {
          preferencesBtns.forEach((b) => b.classList.remove("faded"));
        }
        checkShowGenerate();
      });
    });
  }

  // Call renderTagButtons on load
  renderTagButtons();

  // Step 1 logic
  daysInput.addEventListener("input", () => {
    daysValue = parseInt(daysInput.value);
    if (daysValue >= 1) {
      step2.style.display = "flex";
    } else {
      step2.style.display = "none";
      step3.style.display = "none";
      step4.style.display = "none";
      generateBtn.disabled = true;
    }
    checkShowGenerate();
  });

  // Update ingredient options based on selected restrictions (multiple)
  function updateIngredientOptions() {
    // If 'none' is selected, show all
    if (restrictionsValue.includes("none")) {
      ingredientsBtns.forEach((ibtn) => (ibtn.style.display = ""));
      return;
    }
    // Build allowed set
    let allowed = new Set([
      "chicken",
      "beef",
      "pork",
      "fish",
      "seafood",
      "tofu",
      "lentils/beans",
      "cheese",
      "eggs",
      "mushrooms",
      "none",
    ]);
    if (restrictionsValue.includes("vegan")) {
      allowed = new Set(["tofu", "lentils/beans", "mushrooms", "none"]);
    }
    if (restrictionsValue.includes("vegetarian")) {
      allowed = new Set(
        [...allowed].filter((x) =>
          [
            "tofu",
            "lentils/beans",
            "cheese",
            "eggs",
            "mushrooms",
            "none",
          ].includes(x)
        )
      );
    }
    if (restrictionsValue.includes("gluten-free")) {
      allowed = new Set(
        [...allowed].filter((x) =>
          [
            "chicken",
            "beef",
            "pork",
            "fish",
            "seafood",
            "tofu",
            "cheese",
            "eggs",
            "mushrooms",
            "none",
          ].includes(x)
        )
      );
    }
    ingredientsBtns.forEach((ibtn) => {
      if (allowed.has(ibtn.dataset.value)) {
        ibtn.style.display = "";
      } else {
        ibtn.style.display = "none";
        ibtn.classList.remove("selected");
        ingredientsValue = ingredientsValue.filter(
          (v) => v !== ibtn.dataset.value
        );
      }
    });
    // If after filtering, nothing is selected, select 'None'
    const visibleBtns = Array.from(ingredientsBtns).filter(
      (b) => b.style.display !== "none"
    );
    if (!visibleBtns.some((b) => b.classList.contains("selected"))) {
      const noneBtn = visibleBtns.find((b) => b.dataset.value === "none");
      if (noneBtn) {
        noneBtn.classList.add("selected");
        ingredientsValue = ["none"];
      }
    }
  }

  // Show Generate button only when all steps are valid (at least one selection in each)
  function checkShowGenerate() {
    if (
      restrictionsValue.length > 0 &&
      ingredientsValue.length > 0 &&
      preferencesValue.length > 0
    ) {
      generateBtn.disabled = false;
      showDishesBtn.disabled = false;
    } else {
      generateBtn.disabled = true;
      showDishesBtn.disabled = true;
    }
    dishListResult.innerHTML = "";
  }

  const corsProxy = "https://corsproxy.io/?";
  const webAppUrl =
    corsProxy +
    encodeURIComponent(
      "https://script.google.com/macros/s/AKfycbwA7R0GYMao0Os9_-5kwkQCONGzPwwRDhTM7nN3QMztOv0XtKPnEXwpjEvAmVfa6qgw/exec"
    );

  async function fetchDishes() {
    try {
      const res = await fetch(webAppUrl);
      if (!res.ok) throw new Error("Failed to fetch dishes");
      const dishes = await res.json();
      return dishes;
    } catch (err) {
      alert("Error loading dishes from the sheet.");
      console.error(err);
      return [];
    }
  }

  function filterDishes(dishes) {
    // Filter by restrictions (tags)
    let filtered = dishes;
    if (!restrictionsValue.includes("none")) {
      filtered = filtered.filter((dish) =>
        restrictionsValue.every((r) =>
          dish.tags.map((t) => t.toLowerCase()).includes(r)
        )
      );
    }
    // Filter by ingredients
    if (!ingredientsValue.includes("none")) {
      filtered = filtered.filter((dish) =>
        ingredientsValue.some((i) =>
          dish.tags.map((t) => t.toLowerCase()).includes(i)
        )
      );
    }
    // Filter by preferences
    if (!preferencesValue.includes("none")) {
      filtered = filtered.filter((dish) =>
        preferencesValue.some((p) =>
          dish.tags.map((t) => t.toLowerCase()).includes(p)
        )
      );
    }
    return filtered;
  }

  function getRandomDish(dishes, usedNames) {
    const available = dishes.filter((d) => !usedNames.has(d.name));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  function displaySchedule(schedule, scheduleDays = []) {
    const result = document.getElementById("scheduleResult");
    result.innerHTML = "";
    if (schedule.length === 0) {
      result.textContent = "No dishes match your filters 😕";
      return;
    }
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Helper to render a week chunk
    function renderWeekTable(weekSchedule, weekDays) {
      const table = document.createElement("table");
      table.className = "schedule-table-wide";
      table.style.width = "100%";
      table.style.marginTop = "1.5rem";
      table.style.background = "#fff5f1";
      table.style.borderRadius = "12px";
      table.style.overflow = "hidden";
      table.style.borderCollapse = "collapse";
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      const emptyTh = document.createElement("th");
      emptyTh.textContent = "";
      headerRow.appendChild(emptyTh);
      for (let i = 0; i < weekSchedule.length; i++) {
        const th = document.createElement("th");
        if (weekDays.length > 0) {
          // Show date and day of week
          const dateStr = weekDays[i];
          const dateObj = new Date(dateStr);
          if (!isNaN(dateObj)) {
            const dayName = dateObj.toLocaleDateString(undefined, {
              weekday: "long",
            });
            th.innerHTML = `<div style='font-size:1.08em;font-weight:600;'>${dayName}</div><div style='font-size:0.97em;font-weight:400;margin-top:0.1em;'>${dateStr}</div>`;
          } else {
            th.textContent = dateStr;
          }
        } else {
          th.textContent = daysOfWeek[i];
        }
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement("tbody");
      // Lunch row
      const lunchRow = document.createElement("tr");
      const lunchLabel = document.createElement("td");
      lunchLabel.textContent = "Lunch";
      lunchRow.appendChild(lunchLabel);
      weekSchedule.forEach((day, dayIdx) => {
        const td = document.createElement("td");
        td.style.cursor = "pointer";
        td.title = "Click to randomize";
        if (day.lunch) {
          td.textContent = day.lunch.name;
          // Add Lucide icons for vegan, vegetarian, gluten-free
          const tags = day.lunch.tags.map((t) => t.toLowerCase());
          if (tags.includes("vegan")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "sprout");
            icon.className = "dish-tag-icon";
            icon.title = "Vegan";
            td.appendChild(icon);
          }
          if (tags.includes("vegetarian")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "leaf");
            icon.className = "dish-tag-icon";
            icon.title = "Vegetarian";
            td.appendChild(icon);
          }
          if (tags.includes("gluten-free")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "wheat-off");
            icon.className = "dish-tag-icon";
            icon.title = "Gluten Free";
            td.appendChild(icon);
          }
        } else {
          td.textContent = "-";
        }
        td.addEventListener("click", async () => {
          td.innerHTML = "<span class='spinner'></span>";
          const allDishes = await fetchDishes();
          const filteredDishes = filterDishes(allDishes);
          // Exclude all currently used lunch and dinner names
          const usedNames = new Set();
          weekSchedule.forEach((d, idx) => {
            if (idx !== dayIdx && d.lunch) usedNames.add(d.lunch.name);
            if (d.dinner) usedNames.add(d.dinner.name);
          });
          const available = filteredDishes.filter(
            (d) => !usedNames.has(d.name)
          );
          if (available.length === 0) {
            td.textContent = "-";
            if (window.lucide) lucide.createIcons();
            return;
          }
          const newDish =
            available[Math.floor(Math.random() * available.length)];
          weekSchedule[dayIdx].lunch = newDish;
          // Re-render cell with icons
          td.textContent = newDish.name;
          const tags = newDish.tags.map((t) => t.toLowerCase());
          if (tags.includes("vegan")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "sprout");
            icon.className = "dish-tag-icon";
            icon.title = "Vegan";
            td.appendChild(icon);
          }
          if (tags.includes("vegetarian")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "leaf");
            icon.className = "dish-tag-icon";
            icon.title = "Vegetarian";
            td.appendChild(icon);
          }
          if (tags.includes("gluten-free")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "wheat-off");
            icon.className = "dish-tag-icon";
            icon.title = "Gluten Free";
            td.appendChild(icon);
          }
          if (window.lucide) lucide.createIcons();
        });
        lunchRow.appendChild(td);
      });
      tbody.appendChild(lunchRow);
      // Dinner row
      const dinnerRow = document.createElement("tr");
      const dinnerLabel = document.createElement("td");
      dinnerLabel.textContent = "Dinner";
      dinnerRow.appendChild(dinnerLabel);
      weekSchedule.forEach((day, dayIdx) => {
        const td = document.createElement("td");
        td.style.cursor = "pointer";
        td.title = "Click to randomize";
        if (day.dinner) {
          td.textContent = day.dinner.name;
          // Add Lucide icons for vegan, vegetarian, gluten-free
          const tags = day.dinner.tags.map((t) => t.toLowerCase());
          if (tags.includes("vegan")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "sprout");
            icon.className = "dish-tag-icon";
            icon.title = "Vegan";
            td.appendChild(icon);
          }
          if (tags.includes("vegetarian")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "leaf");
            icon.className = "dish-tag-icon";
            icon.title = "Vegetarian";
            td.appendChild(icon);
          }
          if (tags.includes("gluten-free")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "wheat-off");
            icon.className = "dish-tag-icon";
            icon.title = "Gluten Free";
            td.appendChild(icon);
          }
        } else {
          td.textContent = "-";
        }
        td.addEventListener("click", async () => {
          td.innerHTML = "<span class='spinner'></span>";
          const allDishes = await fetchDishes();
          const filteredDishes = filterDishes(allDishes);
          // Exclude all currently used lunch and dinner names
          const usedNames = new Set();
          weekSchedule.forEach((d, idx) => {
            if (d.lunch) usedNames.add(d.lunch.name);
            if (idx !== dayIdx && d.dinner) usedNames.add(d.dinner.name);
          });
          const available = filteredDishes.filter(
            (d) => !usedNames.has(d.name)
          );
          if (available.length === 0) {
            td.textContent = "-";
            if (window.lucide) lucide.createIcons();
            return;
          }
          const newDish =
            available[Math.floor(Math.random() * available.length)];
          weekSchedule[dayIdx].dinner = newDish;
          td.textContent = newDish.name;
          const tags = newDish.tags.map((t) => t.toLowerCase());
          if (tags.includes("vegan")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "sprout");
            icon.className = "dish-tag-icon";
            icon.title = "Vegan";
            td.appendChild(icon);
          }
          if (tags.includes("vegetarian")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "leaf");
            icon.className = "dish-tag-icon";
            icon.title = "Vegetarian";
            td.appendChild(icon);
          }
          if (tags.includes("gluten-free")) {
            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "wheat-off");
            icon.className = "dish-tag-icon";
            icon.title = "Gluten Free";
            td.appendChild(icon);
          }
          if (window.lucide) lucide.createIcons();
        });
        dinnerRow.appendChild(td);
      });
      tbody.appendChild(dinnerRow);
      table.appendChild(tbody);
      return table;
    }

    // Chunk schedule and days into weeks
    for (let i = 0; i < schedule.length; i += 7) {
      const weekSchedule = schedule.slice(i, i + 7);
      const weekDays =
        scheduleDays.length > 0 ? scheduleDays.slice(i, i + 7) : [];
      const weekTable = renderWeekTable(weekSchedule, weekDays);
      result.appendChild(weekTable);
    }
    // Scroll to the first table after rendering
    setTimeout(() => {
      const firstTable = result.querySelector("table");
      if (firstTable)
        firstTable.scrollIntoView({ behavior: "smooth", block: "center" });
      if (window.lucide) lucide.createIcons();
    }, 50);
    if (window.lucide) lucide.createIcons();
  }

  async function generateSchedule() {
    const allDishes = await fetchDishes();
    const filteredDishes = filterDishes(allDishes);
    let days = daysValue;
    let scheduleDays = [];
    if (selectedCustomDates.length > 0) {
      days = selectedCustomDates.length;
      scheduleDays = [...selectedCustomDates];
    }
    const schedule = [];
    const usedNames = new Set();
    for (let i = 0; i < days; i++) {
      const lunch = getRandomDish(filteredDishes, usedNames);
      if (lunch) usedNames.add(lunch.name);
      const dinner = getRandomDish(filteredDishes, usedNames);
      if (dinner) usedNames.add(dinner.name);
      schedule.push({ lunch, dinner });
    }
    displaySchedule(schedule, scheduleDays);
  }

  generateBtn.addEventListener("click", () => {
    dishListResult.innerHTML = "";
    generateSchedule();
  });

  showDishesBtn.addEventListener("click", async () => {
    const allDishes = await fetchDishes();
    const filteredDishes = filterDishes(allDishes);
    dishListResult.innerHTML = "";
    if (filteredDishes.length === 0) {
      dishListResult.textContent = "No dishes match your filters 😕";
      return;
    }
    const ul = document.createElement("ul");
    filteredDishes.forEach((dish) => {
      const li = document.createElement("li");
      li.textContent = dish.name;
      // Add Lucide icons for vegan, vegetarian, gluten-free
      const tags = dish.tags.map((t) => t.toLowerCase());
      if (tags.includes("vegan")) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "sprout");
        icon.className = "dish-tag-icon";
        icon.title = "Vegan";
        li.appendChild(icon);
      }
      if (tags.includes("vegetarian")) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "leaf");
        icon.className = "dish-tag-icon";
        icon.title = "Vegetarian";
        li.appendChild(icon);
      }
      if (tags.includes("gluten-free")) {
        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "wheat-off");
        icon.className = "dish-tag-icon";
        icon.title = "Gluten Free";
        li.appendChild(icon);
      }
      ul.appendChild(li);
    });
    dishListResult.appendChild(ul);
    if (window.lucide) lucide.createIcons();
  });

  // --- Add Dish Popup Logic ---
  const addDishBtn = document.getElementById("addDishBtn");
  const addDishPopup = document.getElementById("addDishPopup");
  const addDishForm = document.getElementById("addDishForm");
  const cancelAddDish = document.getElementById("cancelAddDish");
  const addDishMsg = document.getElementById("addDishMsg");
  const addDishRestrictions = document.getElementById("addDishRestrictions");
  const addDishIngredients = document.getElementById("addDishIngredients");
  const addDishPreferences = document.getElementById("addDishPreferences");
  let addDishTagBtns = { restricao: [], ingrediente: [], preferencia: [] };
  let addDishSelected = { restricao: [], ingrediente: [], preferencia: [] };

  // --- Fuzzy duplicate dish name check ---
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function normalizeString(str) {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  }

  let dishNameCheckTimeout;
  async function checkSimilarDishName(name) {
    if (!name) return;
    // Show spinner and message while checking
    addDishMsg.innerHTML = `<span class='spinner' style='width:18px;height:18px;vertical-align:middle;'></span> Checking for similar dishes...`;
    addDishMsg.style.color = "#7a4c2f";
    try {
      const corsProxy = "https://corsproxy.io/?";
      const webAppUrl =
        corsProxy +
        encodeURIComponent(
          "https://script.google.com/macros/s/AKfycbwA7R0GYMao0Os9_-5kwkQCONGzPwwRDhTM7nN3QMztOv0XtKPnEXwpjEvAmVfa6qgw/exec"
        );
      const res = await fetch(webAppUrl);
      if (!res.ok) {
        addDishMsg.textContent = "";
        addDishMsg.style.color = "";
        return;
      }
      const dishes = await res.json();
      const inputNorm = normalizeString(name.trim());
      let similars = [];
      for (const d of dishes) {
        const nNorm = normalizeString(d.name);
        if (
          nNorm === inputNorm ||
          nNorm.includes(inputNorm) ||
          inputNorm.includes(nNorm) ||
          levenshtein(nNorm, inputNorm) <= 2
        ) {
          similars.push(d.name);
        }
      }
      if (similars.length > 0) {
        const list = similars
          .map((s) => s.replace(/(^|\s)\S/g, (l) => l.toUpperCase()))
          .join(", ");
        addDishMsg.innerHTML = `<span style='font-size:0.92em;color:#d4957e;'>Warning: Similar dish${
          similars.length > 1 ? "es" : ""
        } already exist${similars.length > 1 ? "" : "s"}: ${list}</span>`;
        addDishMsg.style.color = "";
      } else {
        addDishMsg.textContent = "";
        addDishMsg.style.color = "";
      }
    } catch (err) {
      addDishMsg.textContent = "";
      addDishMsg.style.color = "";
    }
  }

  const dishNameInput = document.getElementById("dishNameInput");
  dishNameInput.addEventListener("blur", (e) => {
    if (dishNameCheckTimeout) clearTimeout(dishNameCheckTimeout);
    checkSimilarDishName(e.target.value);
  });
  dishNameInput.addEventListener("input", (e) => {
    if (!e.target.value.trim()) {
      addDishMsg.textContent = "";
      addDishMsg.style.color = "";
      if (dishNameCheckTimeout) clearTimeout(dishNameCheckTimeout);
      return;
    }
    if (dishNameCheckTimeout) clearTimeout(dishNameCheckTimeout);
    dishNameCheckTimeout = setTimeout(() => {
      checkSimilarDishName(e.target.value);
    }, 500);
  });

  addDishBtn.addEventListener("click", () => {
    addDishPopup.classList.add("active");
    addDishMsg.textContent = "";
  });
  cancelAddDish.addEventListener("click", () => {
    addDishPopup.classList.remove("active");
    addDishForm.reset();
    Object.values(addDishTagBtns)
      .flat()
      .forEach((btn) => btn.classList.remove("selected"));
    addDishSelected = { restricao: [], ingrediente: [], preferencia: [] };
  });

  async function renderAddDishTagButtons() {
    const tags = await fetchTags();
    // Clear containers
    addDishRestrictions.innerHTML = "";
    addDishIngredients.innerHTML = "";
    addDishPreferences.innerHTML = "";
    addDishTagBtns = { restricao: [], ingrediente: [], preferencia: [] };
    // Restrictions
    tags
      .filter((t) => t.categoria === "restricao")
      .forEach((t) => {
        const btn = createBtn(t.tag, "restriction-btn");
        btn.type = "button"; // Ensure it's not a submit button
        btn.addEventListener("click", (e) => {
          e.preventDefault(); // Prevent form submission
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!addDishSelected.restricao.includes(t.tag))
              addDishSelected.restricao.push(t.tag);
          } else {
            addDishSelected.restricao = addDishSelected.restricao.filter(
              (v) => v !== t.tag
            );
          }
        });
        addDishRestrictions.appendChild(btn);
        addDishTagBtns.restricao.push(btn);
      });
    // Ingredients
    tags
      .filter((t) => t.categoria === "ingrediente")
      .forEach((t) => {
        const btn = createBtn(t.tag, "ingredient-btn");
        btn.type = "button";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!addDishSelected.ingrediente.includes(t.tag))
              addDishSelected.ingrediente.push(t.tag);
          } else {
            addDishSelected.ingrediente = addDishSelected.ingrediente.filter(
              (v) => v !== t.tag
            );
          }
        });
        addDishIngredients.appendChild(btn);
        addDishTagBtns.ingrediente.push(btn);
      });
    // Preferences
    tags
      .filter((t) => t.categoria === "preferencia")
      .forEach((t) => {
        const btn = createBtn(t.tag, "preference-btn");
        btn.type = "button";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          btn.classList.toggle("selected");
          if (btn.classList.contains("selected")) {
            if (!addDishSelected.preferencia.includes(t.tag))
              addDishSelected.preferencia.push(t.tag);
          } else {
            addDishSelected.preferencia = addDishSelected.preferencia.filter(
              (v) => v !== t.tag
            );
          }
        });
        addDishPreferences.appendChild(btn);
        addDishTagBtns.preferencia.push(btn);
      });
    if (window.lucide) lucide.createIcons();
  }
  renderAddDishTagButtons();

  // Remove any previous submit event listeners if present (defensive)
  addDishForm.onsubmit = null;
  addDishForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    addDishMsg.innerHTML = `<span class='spinner' style='width:18px;height:18px;vertical-align:middle;'></span> Adding dish...`;
    addDishMsg.style.color = "#7a4c2f";
    const name = document.getElementById("dishNameInput").value.trim();
    const tags = [
      ...addDishSelected.restricao,
      ...addDishSelected.ingrediente,
      ...addDishSelected.preferencia,
    ];
    if (!name) {
      addDishMsg.textContent = "Please enter a dish name.";
      addDishMsg.style.color = "";
      return;
    }
    if (tags.length === 0) {
      addDishMsg.textContent = "Please select at least one tag.";
      addDishMsg.style.color = "";
      return;
    }

    // Disable submit button to prevent double submit
    const submitBtn = addDishForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const corsProxy = "https://corsproxy.io/?";
      const webAppUrl =
        corsProxy +
        encodeURIComponent(
          "https://script.google.com/macros/s/AKfycbwA7R0GYMao0Os9_-5kwkQCONGzPwwRDhTM7nN3QMztOv0XtKPnEXwpjEvAmVfa6qgw/exec"
        );
      const response = await fetch(webAppUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "dish", name, tags }),
      });
      // Only show error if fetch fails or response is not ok
      if (!response.ok) {
        addDishMsg.textContent = "Failed to add dish. Please try again later.";
        addDishMsg.style.color = "#d4957e";
        return;
      }
      // After POST, fetch all dishes and check for exact match
      addDishMsg.innerHTML = `<span class='spinner' style='width:18px;height:18px;vertical-align:middle;'></span> Verifying...`;
      addDishMsg.style.color = "#7a4c2f";
      const allDishes = await fetchDishes();
      const normalize = (str) =>
        str
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
          .trim();
      const tagsSet = new Set(tags.map(normalize));
      const found = allDishes.some(
        (dish) =>
          normalize(dish.name) === normalize(name) &&
          dish.tags.length === tags.length &&
          dish.tags.map(normalize).every((t) => tagsSet.has(t))
      );
      if (found) {
        addDishMsg.textContent = `Dish \"${name}\" added successfully! ✨`;
        addDishMsg.style.color = "";
        addDishForm.reset();
        Object.values(addDishTagBtns)
          .flat()
          .forEach((btn) => btn.classList.remove("selected"));
        addDishSelected = { restricao: [], ingrediente: [], preferencia: [] };
        setTimeout(() => {
          addDishPopup.classList.remove("active");
          addDishMsg.textContent = "";
          showGlobalNotification("Dish added successfully!");
        }, 1200);
      } else {
        addDishMsg.textContent = "Failed to add dish. Please try again later.";
        addDishMsg.style.color = "#d4957e";
      }
    } catch (error) {
      addDishMsg.textContent = "Failed to add dish. Please try again later.";
      addDishMsg.style.color = "#d4957e";
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Advanced Days Options Logic
  const toggleAdvancedDays = document.getElementById("toggleAdvancedDays");
  const advancedDaysOptions = document.getElementById("advancedDaysOptions");
  const multiDateInput = document.getElementById("multiDateInput");
  const customDatesList = document.getElementById("customDatesList");
  let selectedCustomDates = [];

  // Toggle advanced options
  if (toggleAdvancedDays && advancedDaysOptions) {
    toggleAdvancedDays.addEventListener("click", () => {
      advancedDaysOptions.classList.toggle("active");
      toggleAdvancedDays.classList.toggle("open");
    });
  }
  // Use flatpickr for multi-date selection
  if (multiDateInput) {
    flatpickr(multiDateInput, {
      mode: "multiple",
      dateFormat: "Y-m-d",
      onChange: function (selectedDates, dateStr, instance) {
        selectedCustomDates = selectedDates.map((d) =>
          instance.formatDate(d, "Y-m-d")
        );
        daysInput.value = selectedCustomDates.length;
        daysInput.dispatchEvent(new Event("input"));
        renderCustomDatesList();
      },
    });
  }
  function renderCustomDatesList() {
    customDatesList.innerHTML = "";
    selectedCustomDates.forEach((date) => {
      const item = document.createElement("span");
      item.className = "custom-date-item";
      item.textContent = date;
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-date-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.title = "Remove date";
      removeBtn.onclick = () => {
        selectedCustomDates = selectedCustomDates.filter((d) => d !== date);
        // Update flatpickr selected dates
        if (multiDateInput._flatpickr) {
          multiDateInput._flatpickr.setDate(selectedCustomDates, true);
        }
        renderCustomDatesList();
        daysInput.value = selectedCustomDates.length;
        daysInput.dispatchEvent(new Event("input"));
      };
      item.appendChild(removeBtn);
      customDatesList.appendChild(item);
    });
  }
});

function showGlobalNotification(message) {
  const notif = document.getElementById("globalNotification");
  notif.textContent = message;
  notif.classList.add("show");
  setTimeout(() => {
    notif.classList.remove("show");
    notif.textContent = "";
  }, 2000);
}
