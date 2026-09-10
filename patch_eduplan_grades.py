import re

with open("src/pages/EducationalPlan.tsx", "r") as f:
    code = f.read()

# Replace hardcoded grade in API call
api_call_search = """        body: JSON.stringify({
          subject,
          grade: "10, 11, 12",
          topic,
          files: uploadedFiles
        }),"""
api_call_replace = """        body: JSON.stringify({
          subject,
          grade: selectedGrade.toString(),
          topic,
          files: uploadedFiles
        }),"""
code = code.replace(api_call_search, api_call_replace)

# We need to define selectedGrade state
state_search = """  const [topic, setTopic] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{data: string, type: string, name: string}[]>([]);"""
state_replace = """  const [topic, setTopic] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [uploadedFiles, setUploadedFiles] = useState<{data: string, type: string, name: string}[]>([]);"""
code = code.replace(state_search, state_replace)

# Replace grade: 10 with grade: selectedGrade in map
map_search = """          id: Date.now().toString() + index,
          grade: 10,
          stt: plans.length + index + 1,"""
map_replace = """          id: Date.now().toString() + index,
          grade: selectedGrade,
          stt: plans.length + index + 1,"""
code = code.replace(map_search, map_replace)

# Replace grade: 10 in Add blank
add_blank_search = """                  id: Date.now().toString(),
                  grade: 10,
                  stt: plans.length + 1,"""
add_blank_replace = """                  id: Date.now().toString(),
                  grade: selectedGrade,
                  stt: plans.length + 1,"""
code = code.replace(add_blank_search, add_blank_replace)

# Now we need to add the grade selector UI.
# Let's find the controls div.
controls_search = """            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <select 
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >"""
controls_replace = """            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Khối lớp</label>
                <select 
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Lớp {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Môn học</label>
                <select 
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >"""
code = code.replace(controls_search, controls_replace)

with open("src/pages/EducationalPlan.tsx", "w") as f:
    f.write(code)

print("EducationalPlan patched")
