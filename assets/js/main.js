//Name the list title
const typeHandler = function (e) {
  document.getElementById('printTitle').innerHTML = e.target.value
  localStorage.setItem('Title', e.target.value) //Save Title to localStorage
}

document.getElementById('inputTitle').addEventListener('input', typeHandler)
document.getElementById('inputTitle').addEventListener('propertychange', typeHandler)

//Load Title from localStorage if exist
if (localStorage.getItem('Title') != null) {
  document.getElementById('printTitle').innerHTML = localStorage.getItem('Title')
  document.getElementById('inputTitle').defaultValue = localStorage.getItem('Title')
}

//Add date to bottom
document.getElementById('date').innerHTML = Date()

//Excel barcode functions
document.getElementById('uploadedFile').addEventListener('change', handleFileSelect, false)

function handleFileSelect(evt) {
  document.getElementById('excelDataTable').innerHTML = ''
  let files = evt.target.files
  let xl2json = new ExcelToJSON()
  xl2json.parseExcel(files[0])
  delete files
  delete xl2json
}

class ExcelToJSON {
  constructor() {
    this.parseExcel = function (file) {
      var reader = new FileReader()

      reader.onload = function (e) {
        const data = e.target.result

        const workbook = XLSX.read(data, {
          type: 'binary',
        })

        workbook.SheetNames.forEach(function (sheetName) {
          const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName])
          const json_object = JSON.stringify(XL_row_object)
          console.log(json_object)
          buildHtmlTable(JSON.parse(json_object), '#excelDataTable')

          const table = document.getElementById('excelDataTable')
          // select table data
          const targetTDs = table.querySelectorAll('tr > td:nth-child(2)')
          //   console.log(table)
          // console.log(targetTDs)
          // Chance first (All) column to svg image barcode
          for (let i = 0; i < targetTDs.length; i++) {
            const td = targetTDs[i]
            // console.log(td)
            td.innerHTML =
              '<svg class="barcode" jsbarcode-value="' +
              td.innerHTML +
              '" jsbarcode-height="35" jsbarcode-width="2" jsbarcode-background="#f0efeb"</svg>'
            //id="barcode-' + td.innerHTML +'"
          }
          // Init all barcode clases to
          JsBarcode('.barcode').init()
        })
      }

      reader.onerror = function (ex) {
        console.log(ex)
      }

      reader.readAsBinaryString(file)
    }
  }
}

// Builds the HTML Table out of myList.
function buildHtmlTable(myList, selector) {
  var columns = addAllColumnHeaders(myList, selector)

  for (var i = 0; i < myList.length; i++) {
    var row$ = $('<tr/>')
    for (var colIndex = 0; colIndex < columns.length; colIndex++) {
      var cellValue = myList[i][columns[colIndex]]

      if (colIndex === 0) {
      }
      if (cellValue == null) cellValue = ''
      row$.append($('<td/>').html(cellValue))
    }

    $(selector).append(row$)
  }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(myList, selector) {
  const columnSet = []
  const headerTr$ = $('<tr/>')

  for (let i = 0; i < myList.length; i++) {
    const rowHash = myList[i]
    for (const key in rowHash) {
      if ($.inArray(key, columnSet) === -1) {
        columnSet.push(key)
        headerTr$.append($('<th/>').html(key))
      }
    }
  }
  $(selector).append(headerTr$)

  return columnSet
}

function SetBarcodeHeight(height) {
  let elements = document.querySelectorAll('.barcode')
  for (let i = 0; i < elements.length; i++) {
    const currentElements = elements[i]
    currentElements.setAttribute('jsbarcode-height', height)
  }
  JsBarcode('.barcode').init()
}

function drag() {
  $('.newTable').each(function (index, el) {
    const $dragArea = $(el)
    // 是否為點擊狀態
    let isDown = false
    // 是否為移動狀態
    let isMoved = false
    // 起始 X 軸數值
    let startX
    // 卷軸數值
    let scrollLeft

    $dragArea.on('mousedown', function (event) {
      event.preventDefault()
      isMoved = false
      isDown = true

      startX = event.pageX - $dragArea.offset().left
      scrollLeft = $dragArea.scrollLeft()
      $dragArea.css('cursor', 'grabbing')
    })

    $dragArea.on('mouseleave', function () {
      isMoved = false
      isDown = false
    })

    $dragArea.on('mouseup', function (event) {
      event.preventDefault()
      isDown = false
      $dragArea.css('cursor', 'grab')
    })

    $dragArea.on('mousemove', function (event) {
      event.preventDefault()
      isMoved = true
      if (!isDown) return
      const x = event.pageX - $dragArea.offset().left
      const walk = (x - startX) * 3
      $dragArea.scrollLeft(scrollLeft - walk)
    })
  })
}

function listener() {
  $.each($('.table-bordered'), function (index, value) {
    const newTable = $('<div class="newTable"></div>')
    $(this).before(newTable)
    newTable.append($(this))
  })
}

$(() => {
  drag()
  listener()
})

// var doc = new jsPDF()
// var specialElementHandlers = {
//   '.results': function (element, renderer) {
//     return true
//   },
// }
// $('#save').click(function () {
//   doc.fromHTML($('.results').html(), 15, 15, {
//     width: 190,
//     elementHandlers: specialElementHandlers,
//   })
//   doc.save('barcode.pdf')
// })
function saveAsPDF() {
  // Choose the element id which you want to export.
  var element = document.querySelector('.results')
  // element.style.width = '700px'
  // element.style.height = '900px'
  var opt = {
    margin: 0.5,
    filename: 'file.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', precision: '12' },
  }

  // choose the element and pass it to html2pdf() function and call the save() on it to save as pdf.
  html2pdf().set(opt).from(element).save()
}
