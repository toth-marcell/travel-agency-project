const destinationSelect = document.getElementById("destinationSelect");
const accommodationSelect = document.getElementById("accommodationSelect");
function updateAccommodations() {
  const destId = destinationSelect.value;
  let assignedFirst = false;
  for (const opt of accommodationSelect.children) {
    if (opt.dataset.destid == destId) {
      opt.style.display = "block";
      if (!assignedFirst) {
        accommodationSelect.value = opt.value;
        assignedFirst = true;
      }
    } else opt.style.display = "none";
  }
}
updateAccommodations();
destinationSelect.onchange = updateAccommodations;
