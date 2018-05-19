const ALPHABET = ['а','ꙗ','б','в','г','д','е','ѥ','ж','жд','ѕ','з','и','j','i̯','к','л','л҄','м','н','н҄','о','п','р','р҄','с','т','у','х','ц','ч','ш','щ','ъ','ы','ь','ѣ','ю','ѧ','ѩ','ѫ','ѭ','1','2']

class OSD {
  constructor(el) {
    this.filters = [
      {name: 'norm', type: 'contains', value: ''},
      {name: 'mphl', type: 'contains', value: ''},
      {name: 'root_number', type: 'array', value: ''},
      {name: 'root_form', type: 'array', value: ''},
      {name: 'par_index', type: 'array', value: ''},
      {name: 'class', type: 'select', value: ''},
    ]
    this.searchFields = {}
    this.el = el

    this.loadJSON(res => {
      this.data = JSON.parse(res)
      this.initTable()
    })

    this.filters.forEach(f => {
      if(f.type !== 'select') {
        Handsontable.dom.addEvent(document.getElementById(f.name), 'keyup', e => {
          f.value = "" + e.target.value
          this.filter()
        })
      } else {
        Handsontable.dom.addEvent(document.getElementById(f.name), 'change', e => {
          f.value = "" + e.target.value
          this.filter()
        })
      }

      const optEl = document.getElementById(f.name + '-opt')
      if(optEl) {
        Handsontable.dom.addEvent(optEl, 'change', e => {
          f.type = e.target.value
          this.filter()
        })
      }
    })

    Handsontable.dom.addEvent(document.getElementById('reset'), 'click', e => {
      this.reset()
      const elems = document.querySelectorAll('.sort button')
      elems.forEach(el => {
        el.classList.remove('active')
      })
    })

    this.attachKeyboard()

    Handsontable.dom.addEvent(document.getElementById('reverse-sort'), 'click', e => {
      const isActive = e.target.classList.contains('active')
      const cols = [1,2,3]
      const elems = document.querySelectorAll('.sort button')
      elems.forEach(el => {
        el.classList.remove('active')
      })
      if(isActive) {
        e.target.classList.remove('active')
      } else {
        e.target.classList.add('active')
      }
    })
  }

  initTable() {
    const osdSettings = {
      data: this.data,
      columns: [
        {
          data: 'root_number',
          type: 'numeric',
          className: 'htCenter',
          readOnly: true
        },
        {
          data: 'root_form',
          type: 'text',
          readOnly: true,
          sortFunction: sortAlphabetically
        },
        {
          data: 'mphl',
          type: 'text',
          readOnly: true,
          sortFunction: sortAlphabetically
        },
        {
          data: 'norm',
          type: 'text',
          readOnly: true,
          sortFunction: sortAlphabetically
        },
        {
          data: 'par_index',
          type: 'text',
          readOnly: true
        },
        {
          data: 'class',
          type: 'text',
          readOnly: true
        },
        {
          data: 'extent',
          type: 'text',
          readOnly: true
        },
        {
          data: 'reference',
          type: 'numeric',
          className: 'htLeft',
          readOnly: true
        }
      ],
      stretchH: 'all',
      width: '100%',
      autoWrapRow: true,
      rowHeaders: true,
      dropdownMenu: true,
      columnSorting: {
        column: 3,
        sortOrder: true
      },
      sortIndicator: true,
      colHeaders: [
        'root #',
        'root form',
        'mphl',
        'norm',
        'par index',
        'class',
        'extent',
        'notice'
      ]
    }
    this.table = new Handsontable(this.el, osdSettings)
  }

  attachKeyboard() {
    $('#norm,#mphl,#root_form').keyboard({
    	layout: 'custom',
      autoAccept: true,
    	customLayout: {
    		'normal' : [
    			// "n(a):title_or_tooltip"; n = new key, (a) = actual key, ":label" = title_or_tooltip (use an underscore "_" in place of a space " ")
    			'\u0430(а):lower_case_а \uA657(ꙗ):lower_case_iotified_a \u0431(б):lower_case_be \u0432(в):lower_case_ve \u0432(г):lower_case_ghe \u0434(д):lower_case_de \u0435(е):lower_case_ie \u0465(ѥ):lower_case_iotified_e \u0436(ж):lower_case_zhe \u0436\u0434(жд):lower_case_zhd',
          '\u0455(ѕ):lower_case_dze \u0437(з):lower_case_ze \u0438(и):lower_case_ii \u043A(к):lower_case_ka \u043B(л):lower_case_el \u043B\u0484(л҄):lower_case_el_pal \u043C(м):lower_case_em \u043D(н):lower_case_en \u043D\u0484(н҄):lower_case_en_pal \u043E(о):lower_case_o',
          '\u043F(п):lower_case_pe \u0440(р):lower_case_er \u0440\u0484(р҄):lower_case_er_pal \u0441(с):lower_case_es \u0442(т):lower_case_te \u0443(у):lower_case_u \u0445(х):lower_case_ha \u0446(ц):lower_case_tse \u0447(ч):lower_case_che \u0448(ш):lower_case_sha',
          '\u0449(щ):lower_case_shcha \u044A(ъ):lower_case_hard_sign \u044B(ы):lower_case_yeru \u044C(ь):lower_case_soft_sign \u0463(ѣ):lower_case_yat \u044E(ю):lower_case_yu \u0467(ѧ):lower_case_little_yus \u0469(ѩ):lower_case_iotified_little_yus \u046B(ѫ):lower_case_big_yus \u046D(ѭ):lower_case_iotified_big_yus',
          '\u0458(ј):lower_case_je \u0069\u032F(i̯):lower_case_close_front_vowel'
    		]
    	},
    	usePreview: false // no preveiw
    })
  }

  sort(prop, order) {
    let data = this.data.slice()

    if(order === 'asc') {
      data.sort((a, b) => sortByAlphabet(a[prop], b[prop], true))
    } else {
      data.sort((b, a) => sortByAlphabet(b[prop], a[prop], true))
    }

    this.table.loadData(data)
  }

  filter() {
  	let row, r_len, col, c_len
  	let data = this.data
    let filters = this.filters
  	let array = []

    for (row = 0, r_len = data.length; row < r_len; row++) {
      let match = true
  		for(col = 0, c_len = filters.length; col < c_len; col++) {
        const filterType = filters[col].type
        const filterName = filters[col].name
        const filterValue = filters[col].value
        const rowValue = String(data[row][filters[col].name])

        let local = true
        if(filterValue !== '') {
          if(filterType === 'array') {
            const values = filterValue.split(',').map(v => v.trim()).filter(v => v !== '')
            if(values.indexOf(rowValue) === -1) {
              local = false
            }
          } else if (filterType === 'contains') {
            if(!rowValue.includes(filterValue)) {
              local = false
            }
          } else if (filterType === 'startsWith') {
            if(!rowValue.startsWith(filterValue)) {
              local = false
            }
          } else if (filterType === 'endsWith') {
            if(!rowValue.endsWith(filterValue)) {
              local = false
            }
          } else if (filterType === 'select') {
            if(rowValue !== filterValue) {
              local = false
            }
          }
        }
        match = match && local
   		}
  		if(match) array.push(data[row])
  	}
  	this.table.loadData(array)
  }

  reset() {
    this.filters.forEach(f => {
      f.value = ''
      document.getElementById(f.name).value = ''
    })
    this.filter()
  }

  loadJSON(cb) {
    let xobj = new XMLHttpRequest()
    xobj.overrideMimeType("application/json")
    xobj.open('GET', 'data.json', true)
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
        cb(xobj.responseText)
      }
    }
    xobj.send(null)
  }

}

let sortAlphabetically = function(sortOrder) {
  const isReverse = document.getElementById('reverse-sort').classList.contains('active')

  if(isReverse) {
    return function(a, b) {
      return sortOrder ? sortByAlphabet(a[1],b[1],true) : sortByAlphabet(b[1],a[1],true)
    }
  } else {
    return function(a, b) {
      return sortOrder ? sortByAlphabet(a[1],b[1]) : sortByAlphabet(b[1],a[1])
    }
  }
}

let sortByAlphabet = function(a, b, rev) {
  // remove slashes, asterisks, dots, round brackets and spaces
  a = a.replace(/\/|\*|\s|\.|\(|\)/g,'')
  b = b.replace(/\/|\*|\s|\.|\(|\)/g,'')

  if(rev) {
    // remove numbers
    a = reverseWord(a.replace(/\d/g,''))
    b = reverseWord(b.replace(/\d/g,''))
  }

  const aidx = getIndexesInAlphabet(a)
  const bidx = getIndexesInAlphabet(b)

  let res = 0

  for(let i=0; i < Math.min(aidx.length, bidx.length); i++) {
    if(aidx[i] > bidx[i]) {
      res = 1
      break
    } else if(aidx[i] < bidx[i]) {
      res = -1
      break
    }
  }

  return res
}

let getIndexesInAlphabet = function(chars) {
  let skipNext = false

  return chars.split('').reduce((acc, item, i, arr) => {
    if(skipNext) {
      skipNext = false
      return acc
    }

    const nextItem = arr[i+1]
    if(nextItem) {
      if(ALPHABET.indexOf(item + nextItem)>-1) {
        skipNext = true
        acc.push(ALPHABET.indexOf(item + nextItem))
        return acc
      }
    }

    const index = ALPHABET.indexOf(item)
    if (index < 0) {
      throw new Error(item + 'is not a valid ALPHABETic character.')
    }
    acc.push(index)
    return acc
  }, [])
}

let reverseWord = function(word) {
  let skipNext = false

  return word.split('').reduceRight((acc, item, i, arr) => {
    if(skipNext) {
      skipNext = false
      return acc
    }

    const nextItem = arr[i-1]
    if(nextItem) {
      if(ALPHABET.indexOf(nextItem + item)>-1) {
        skipNext = true
        acc += nextItem + item
        return acc
      }
    }

    acc += item
    return acc
  }, '')
}

let osd = new OSD(document.querySelector('#osd'))
