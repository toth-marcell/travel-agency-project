const destinationSelect = document.getElementById("destinationSelect");
const accommodationSelect = document.getElementById("accommodationSelect");
function updateAccommodations() {
  const selectedAccomodation = accommodationSelect.value;
  const destId = destinationSelect.value;
  let assignedFirst = false;
  for (const opt of accommodationSelect.children) {
    if (opt.dataset.destid == destId) {
      opt.style.display = "block";
      if (!assignedFirst || opt.value == selectedAccomodation) {
        accommodationSelect.value = opt.value;
        assignedFirst = true;
      }
    } else opt.style.display = "none";
  }
}
updateAccommodations();
destinationSelect.onchange = updateAccommodations;
