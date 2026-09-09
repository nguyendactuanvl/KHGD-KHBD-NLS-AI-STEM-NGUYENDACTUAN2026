with open("index.html", "r") as f:
    code = f.read()

if "<style>" not in code:
    code = code.replace("</head>", """
    <style>
      @media print {
        body * {
          visibility: hidden;
        }
        .printable-matrix, .printable-matrix * {
          visibility: visible;
        }
        .printable-matrix {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    </style>
  </head>
""")
    with open("index.html", "w") as f:
        f.write(code)
    print("Patched index.html with print styles")
else:
    print("Styles already present")
