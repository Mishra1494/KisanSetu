document.addEventListener("DOMContentLoaded", () => {
    console.log("Website Loaded");
  
    const buttons = document.querySelectorAll("button, .btn");
    buttons.forEach((btn) => {
      btn.addEventListener("mouseover", () => {
        btn.style.transform = "scale(1.05)";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "scale(1)";
      });
    });
  
    // Future: Chatbot functionality can be added here
    document.querySelector(".chatbot").addEventListener("click", () => {
      alert("Chatbot clicked! (Coming Soon 🤖)");
    });
  });
  document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
  
    menuToggle.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  });
  
  
  