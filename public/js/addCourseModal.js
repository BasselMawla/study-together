$(document).ready(function(){
  $("#add-course-modal").on("show.bs.modal", function (event) {
    var courseLink = $(event.relatedTarget); // Link that triggered the modal
    var courseCode = courseLink.data("course");

    var modal = $(this)
    modal.find("#course-name-label").text("Register for " + courseCode + "?");
    modal.find("#course-name-input").val(courseCode);
  })
});