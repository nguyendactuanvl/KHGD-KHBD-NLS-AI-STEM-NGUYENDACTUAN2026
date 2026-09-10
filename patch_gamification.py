import re

with open("src/pages/Gamification.tsx", "r") as f:
    code = f.read()

# Replace the broken block
target = """  useEffect(() => {
    
  const askAi = async () => {"""

replacement = """  useEffect(() => {
    return () => {
      if (spinInterval.current) clearTimeout(spinInterval.current);
    };
  }, []);

  const askAi = async () => {"""

code = code.replace(target, replacement)

# Remove the old floating return block
old_return = """  return () => {
      if (spinInterval.current) clearTimeout(spinInterval.current);
    };
  }, []);"""

code = code.replace(old_return, "")

with open("src/pages/Gamification.tsx", "w") as f:
    f.write(code)

print("Patched Gamification!")
