// DOM elements
const carForm = document.getElementById("carForm");
const carList = document.getElementById("carList");
const carIdInput = document.getElementById("carId");

// Buttons
const addButton = document.getElementById("addButton");
const deleteButton = document.getElementById("deleteButton");
const updateButton = document.getElementById("updateButton");
const modalBackdrop = document.querySelector('[data-dialog-backdrop="modal"]');
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalCancel = document.querySelector('[data-dialog-close="true"]:first-child');
const modalConfirm = document.querySelector('[data-dialog-close="true"]:last-child');

let currentAction = null;

// Fetch all cars
function fetchCars() {
  fetch("http://localhost:8000/cars")
    .then((res) => res.json())
    .then((cars) => {
      carList.innerHTML = "";
      cars.forEach((car) => {
        const div = document.createElement("div");
        div.className =
          "p-4 bg-[#d46e77] text-white rounded-lg border-5 border-[#5c0d2b] shadow-md hover:shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105";
        div.innerHTML = `
          <div class="font-bold" style="color: ${car.color}">${car.carName}</div>
          <div class="font-medium" style="color: ${car.color}">${car.carBrand}</div>
          <div class="text-sm">Color: ${car.color}</div>
          <div class="text-sm absolute top-4 right-4">ID: ${car.id}</div>
        `;
        div.addEventListener("click", () => {
          carIdInput.value = car.id;
          document.getElementById("carName").value = car.carName;
          document.getElementById("carBrand").value = car.carBrand;
          document.getElementById("color").value = car.color;
        });

        carList.appendChild(div);
      });
    });
}

// Add car
addButton.addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default form submission
  const carData = getCarData();
  if (!carData.carName || !carData.carBrand) {
    showModal("Error", "Please fill in all required fields before adding a car.");
    return;
  }
  currentAction = () => {
    fetch("http://localhost:8000/cars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData),
    })
      .then((res) => res.json())
      .then(() => {
        resetForm();
        fetchCars();
        showModal("Success", "Car added successfully!");
      })
      .catch(() => {
        showModal("Error", "Failed to add car.");
      });
  };
  showModal("Confirm", "Are you sure you want to add this car?");
});

// Delete car
deleteButton.addEventListener("click", () => {
  const id = carIdInput.value;
  if (!id) {
    showModal("Error", "No car selected to delete.");
    return;
  }
  currentAction = () => {
    fetch(`http://localhost:8000/cars/${id}`, { method: "DELETE" })
      .then(() => {
        resetForm();
        fetchCars();
        showModal("Success", "Car deleted successfully!");
      })
      .catch(() => showModal("Error", "Failed to delete car."));
  };
  showModal("Confirm", "Are you sure you want to delete this car?");
});

// Update car
updateButton.addEventListener("click", () => {
  const id = carIdInput.value;
  const carData = getCarData();
  if (!id) {
    showModal("Error", "No car selected to update.");
    return;
  }
  currentAction = () => {
    fetch(`http://localhost:8000/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData),
    })
      .then(() => {
        resetForm();
        fetchCars();
        showModal("Success", "Car updated successfully!");
      })
      .catch(() => showModal("Error", "Failed to update car."));
  };
  showModal("Confirm", "Are you sure you want to update this car?");
});

// Get car data from form
function getCarData() {
  return {
    carName: document.getElementById("carName").value,
    carBrand: document.getElementById("carBrand").value,
    color: document.getElementById("color").value,
  };
}

// Reset the form
function resetForm() {
  carForm.reset();
  carIdInput.value = "";
}

// Show modal
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;
  modalBackdrop.classList.remove("pointer-events-none", "opacity-0");
  modalBackdrop.classList.add("pointer-events-auto", "opacity-100");
}

// Hide modal
function hideModal() {
  modalBackdrop.classList.add("pointer-events-none", "opacity-0");
  modalBackdrop.classList.remove("pointer-events-auto", "opacity-100");
}

// Modal buttons
modalCancel.addEventListener("click", () => {
  hideModal();
});

modalConfirm.addEventListener("click", () => {
  if (currentAction) {
    currentAction();
    currentAction = null;
  }
  hideModal();
});

// Prevent form submission reload
carForm.addEventListener("submit", (e) => e.preventDefault());

// Fetch cars on load
fetchCars();