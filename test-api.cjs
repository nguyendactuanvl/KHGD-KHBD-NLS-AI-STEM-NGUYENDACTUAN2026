async function test() {
  const res = await fetch("http://localhost:3000/api/generate-lesson-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lesson: "Test",
      requirement: "Test",
      digitalComp: "Test",
      aiComp: "Test",
      stem: "Test",
      grade: "10",
      subject: "Toán",
      periods: "1"
    })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 200));
}
test();
