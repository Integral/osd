import Handsontable from"handsontable";import jquery from"jquery";import"virtual-keyboard/dist/js/jquery.keyboard.js";import"virtual-keyboard/dist/js/jquery.keyboard.extension-all.min.js";const ALPHABET=["а","ꙗ","б","в","г","д","е","ѥ","ж","жд","ѕ","з","и","j","i̯","к","л","л҄","м","н","н҄","о","п","р","р҄","с","т","у","х","ц","ч","ш","щ","ъ","ы","ь","ѣ","ю","ѧ","ѩ","ѫ","ѭ","1","2"];class OSD{constructor(e){this.filters=[{name:"id",type:"array",value:""},{name:"norm",type:"contains",value:""},{name:"mphl",type:"contains",value:""},{name:"root_number",type:"array",value:""},{name:"root_form",type:"array",value:""},{name:"par_index",type:"select",value:""},{name:"class",type:"select",value:""}],this.searchFields={},this.el=e,this.counterEl=jquery(".total .counter"),this.spinner=jquery(".spinner"),this.loadJSON(e=>{this.data=JSON.parse(e);this.initTable();this.spinner.hide();this.updateCounter(this.data.length)}),this.filters.forEach(e=>{"select"!==e.type?Handsontable.dom.addEvent(document.getElementById(e.name),"keyup",t=>{e.value=""+t.target.value;this.filter()}):Handsontable.dom.addEvent(document.getElementById(e.name),"change",t=>{e.value=""+t.target.value;this.filter()});const t=document.getElementById(e.name+"-opt");t&&Handsontable.dom.addEvent(t,"change",t=>{e.type=t.target.value;this.filter()})}),Handsontable.dom.addEvent(document.getElementById("reset"),"click",e=>{this.reset();const t=document.querySelectorAll(".sort button");t.forEach(e=>{e.classList.remove("active")})}),jquery.keyboard.keyaction.accept=(e=>{e.close(!0);const t=e.el.id;const a=Object.keys(this.filters).findIndex(e=>this.filters[e].name===t);this.filters[a].value=e.el.value;this.filter();return!0}),this.attachKeyboard(),Handsontable.dom.addEvent(document.getElementById("reverse-sort"),"click",e=>{const t=e.target.classList.contains("active");const a=document.querySelectorAll(".sort button");a.forEach(e=>{e.classList.remove("active")});t?e.target.classList.remove("active"):e.target.classList.add("active")}),Handsontable.dom.addEvent(document.getElementById("download"),"click",e=>{this.downloadCSV()})}initTable(){const e={data:this.data,columns:[{data:"id",type:"numeric",className:"htCenter",readOnly:!0},{data:"root_number",type:"numeric",className:"htCenter",readOnly:!0},{data:"root_form",type:"text",readOnly:!0,columnSorting:{compareFunctionFactory:sortAlphabetically}},{data:"mphl",type:"text",readOnly:!0,columnSorting:{compareFunctionFactory:sortAlphabetically}},{data:"norm",type:"text",readOnly:!0,columnSorting:{compareFunctionFactory:sortAlphabetically}},{data:"par_index",type:"text",readOnly:!0},{data:"class",type:"text",readOnly:!0},{data:"reference",type:"text",className:"htLeft",readOnly:!0}],stretchH:"all",width:"100%",autoWrapRow:!0,dropdownMenu:!0,columnSorting:{sortEmptyCells:!0,initialConfig:{column:3,sortOrder:"asc"}},sortIndicator:!0,colHeaders:["Id","Номер корня","Вид корня","Морфонология","Графика","Индекс","Класс","Ссылка"]};this.table=new Handsontable(this.el,e),Handsontable.hooks.add("afterColumnSort",(e,t)=>{void 0===t&&this.filter()},this.table),Handsontable.hooks.add("afterLoadData",()=>{const e=this.table.getData().length;this.updateCounter(e)},this.table)}attachKeyboard(){this.kb=jquery("#norm,#mphl,#root_form").keyboard({layout:"custom",autoAccept:!0,closeByClickEvent:!0,customLayout:{normal:["а(а):lower_case_а ꙗ(ꙗ):lower_case_iotified_a б(б):lower_case_be в(в):lower_case_ve в(г):lower_case_ghe д(д):lower_case_de е(е):lower_case_ie ѥ(ѥ):lower_case_iotified_e ж(ж):lower_case_zhe жд(жд):lower_case_zhd","ѕ(ѕ):lower_case_dze з(з):lower_case_ze и(и):lower_case_ii к(к):lower_case_ka л(л):lower_case_el л҄(л҄):lower_case_el_pal м(м):lower_case_em н(н):lower_case_en н҄(н҄):lower_case_en_pal о(о):lower_case_o","п(п):lower_case_pe р(р):lower_case_er р҄(р҄):lower_case_er_pal с(с):lower_case_es т(т):lower_case_te у(у):lower_case_u х(х):lower_case_ha ц(ц):lower_case_tse ч(ч):lower_case_che ш(ш):lower_case_sha","щ(щ):lower_case_shcha ъ(ъ):lower_case_hard_sign ы(ы):lower_case_yeru ь(ь):lower_case_soft_sign ѣ(ѣ):lower_case_yat ю(ю):lower_case_yu ѧ(ѧ):lower_case_little_yus ѩ(ѩ):lower_case_iotified_little_yus ѫ(ѫ):lower_case_big_yus ѭ(ѭ):lower_case_iotified_big_yus","ј(ј):lower_case_je i̯(i̯):lower_case_close_front_vowel {accept}"]},display:{accept:"Поиск:Поиск (Shift-Enter)"},usePreview:!1})}sort(e,t){let a=this.data.slice();"asc"===t?a.sort((t,a)=>sortByAlphabet(t[e],a[e],!0)):a.sort((t,a)=>sortByAlphabet(t[e],a[e],!0)),this.table.loadData(a)}filter(){let e,t,a,n,o=this.data,r=this.filters,s=[];for(e=0,t=o.length;e<t;e++){let t=!0;for(a=0,n=r.length;a<n;a++){const n=r[a].type,s=(r[a].name,r[a].value),l=String(o[e][r[a].name]);let i=!0;if(""!==s)if("array"===n){const e=s.split(",").map(e=>e.trim()).filter(e=>""!==e);-1===e.indexOf(l)&&(i=!1)}else"contains"===n?l.includes(s)||(i=!1):"startsWith"===n?l.startsWith(s)||(i=!1):"endsWith"===n?l.endsWith(s)||(i=!1):"select"!==n&&"whole"!==n||l!==s&&(i=!1);t=t&&i}t&&s.push(o[e])}this.table.loadData(s)}reset(){this.filters.forEach(e=>{e.value="";document.getElementById(e.name).value=""}),this.filter()}updateCounter(e){this.counterEl.text(e)}loadJSON(e){let t=new XMLHttpRequest;t.overrideMimeType("application/json"),t.open("GET","data/data.json",!0),t.onreadystatechange=function(){4==t.readyState&&"200"==t.status&&e(t.responseText)},t.send(null)}getCSVString(){const e=this.table.getColHeader();let t=e.join(";")+"\n";for(let a=0;a<this.table.countRows();a++){let n=[];for(let t in e){let e=this.table.colToProp(t),o=this.table.getDataAtRowProp(a,e);n.push(o)}t+=n.join(";"),t+="\n"}return t}downloadCSV(){const e=this.getCSVString();let t=document.createElement("a");t.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(e)),t.setAttribute("download","osd_data.csv"),document.body.appendChild(t),t.click(),document.body.removeChild(t)}}let sortAlphabetically=function(e){return document.getElementById("reverse-sort").classList.contains("active")?function(t,a){return"asc"===e?sortByAlphabet(t,a,!0):sortByAlphabet(a,t,!0)}:function(t,a){return"asc"===e?sortByAlphabet(t,a):sortByAlphabet(a,t)}},sortByAlphabet=function(e,t,a){if(e=e.replace(/\/|\*|\s|\.|\(|\)/g,""),t=t.replace(/\/|\*|\s|\.|\(|\)/g,""),a&&(e=reverseWord(e.replace(/\d/g,"")),t=reverseWord(t.replace(/\d/g,""))),e===t)return 0;const n=getIndexesInAlphabet(e),o=getIndexesInAlphabet(t);let r=0;for(let e=0;e<Math.min(n.length,o.length);e++){if(n[e]>o[e]){r=1;break}if(n[e]<o[e]){r=-1;break}}return 0===r&&n.length!==o.length&&(r=n.length>o.length?1:-1),r},getIndexesInAlphabet=function(e){let t=!1;return e.split("").reduce((e,a,n,o)=>{if(t)return t=!1,e;const r=o[n+1];if(r&&ALPHABET.indexOf(a+r)>-1)return t=!0,e.push(ALPHABET.indexOf(a+r)),e;const s=ALPHABET.indexOf(a);if(s<0)throw new Error(a+"is not a valid ALPHABETic character.");e.push(s);return e},[])},reverseWord=function(e){let t=!1;return e.split("").reduceRight((e,a,n,o)=>{if(t)return t=!1,e;const r=o[n-1];if(r&&ALPHABET.indexOf(r+a)>-1)return t=!0,e+=r+a;e+=a;return e},"")},osd=new OSD(document.querySelector("#osd"));