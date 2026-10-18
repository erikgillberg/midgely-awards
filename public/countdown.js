// Days until a date, for [data-countdown="<ISO date>"].
document.querySelectorAll("[data-countdown]").forEach((el) => {
  const target = new Date(el.dataset.countdown);
  const tick = () => {
    const days = Math.max(0, Math.ceil((target - Date.now()) / 86400000));
    el.querySelector("b").textContent = days.toLocaleString("en-US");
  };
  tick();
  setInterval(tick, 60000);
});
