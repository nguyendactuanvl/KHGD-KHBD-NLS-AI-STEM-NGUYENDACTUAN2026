import re

with open("src/pages/ClassMap.tsx", "r") as f:
    code = f.read()

# Load seats from localstorage
old_init_useEffect = """  // Initialize seats
  useEffect(() => {
    const newSeats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Try to keep existing student if bounds allow
        const existing = seats.find(s => s.row === r && s.col === c);
        newSeats.push({
          row: r, 
          col: c, 
          studentId: existing ? existing.studentId : null
        });
      }
    }
    setSeats(newSeats);
  }, [rows, cols]);"""

new_init_useEffect = """  useEffect(() => {
    const savedConfig = localStorage.getItem("classmap_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.rows) setRows(config.rows);
        if (config.cols) setCols(config.cols);
        if (config.seats) {
          setSeats(config.seats);
          return;
        }
      } catch (e) {}
    }
  }, []);

  // Initialize seats when dimensions change
  useEffect(() => {
    // Only re-init if current seats don't match dimensions or it's empty
    const expectedLength = rows * cols;
    if (seats.length === expectedLength && seats.some(s => s.studentId !== null)) {
        return; // already loaded from localstorage or previously set
    }

    const newSeats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const existing = seats.find(s => s.row === r && s.col === c);
        newSeats.push({
          row: r, 
          col: c, 
          studentId: existing ? existing.studentId : null
        });
      }
    }
    setSeats(newSeats);
  }, [rows, cols]);

  // Save config whenever it changes
  useEffect(() => {
    if (seats.length > 0) {
      localStorage.setItem("classmap_config", JSON.stringify({ rows, cols, seats }));
    }
  }, [rows, cols, seats]);
"""
code = code.replace(old_init_useEffect, new_init_useEffect)

with open("src/pages/ClassMap.tsx", "w") as f:
    f.write(code)

print("classmap patched")
