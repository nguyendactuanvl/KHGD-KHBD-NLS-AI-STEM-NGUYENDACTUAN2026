import re

with open("src/pages/Gamification.tsx", "r") as f:
    code = f.read()

# Replace confirm in handleFileUpload (or whatever the name is)
upload_search = """          if (students.length > 0) {
            if (confirm("Lớp này đã có danh sách học sinh. Bạn có muốn ghi đè danh sách mới (Xóa cũ) không? Chọn OK để XÓA cũ và THAY MỚI, Cancel để THÊM NỐI TIẾP.")) {
               saveStudents(newStudents);
            } else {
               saveStudents([...students, ...newStudents]);
            }
          } else {
             saveStudents(newStudents);
          }
          alert(`Trích xuất thành công ${data.students.length} học sinh!`);
        } else {
          alert("Lỗi: Không tìm thấy tên học sinh");
        }
      } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra khi trích xuất. Vui lòng kiểm tra API Key.");
      }"""
upload_replace = """          if (students.length > 0) {
            showDialog('confirm_upload', "Lớp này đã có danh sách. Ghi đè (Xóa cũ) hay Thêm nối tiếp?", 
              () => {
                 saveStudents(newStudents);
                 showDialog('alert', `Trích xuất thành công ${data.students.length} học sinh!`);
              }, 
              () => {
                 saveStudents([...students, ...newStudents]);
                 showDialog('alert', `Trích xuất thành công ${data.students.length} học sinh!`);
              }
            );
          } else {
             saveStudents(newStudents);
             showDialog('alert', `Trích xuất thành công ${data.students.length} học sinh!`);
          }
        } else {
          showDialog('alert', "Lỗi: Không tìm thấy tên học sinh");
        }
      } catch (err) {
        console.error(err);
        showDialog('alert', "Có lỗi xảy ra khi trích xuất. Vui lòng kiểm tra API Key.");
      }"""
code = code.replace(upload_search, upload_replace)

with open("src/pages/Gamification.tsx", "w") as f:
    f.write(code)

print("patched upload")
