var image_count = 0
var default_tiers = [
    ["S","#644cee",0],
    ["A","#48a1ca",1],
    ["B","#56f3a5",2],
    ["C","#c4f356",3],
    ["D","#ffc72c",4],
    ["F","#da5e3f",5]
]

let tiers_for_linking = []

let tierList = document.getElementById("tier-list")
let imgeList = document.getElementById("images")
let images_for_linking = []


function add_tier(title,clr){

    let newTier = document.createElement("div")
    newTier.className = "tier"
    newTier.setAttribute("ondragover",'allowDrop(event)')
    newTier.setAttribute("ondrop",'drop_handler(event)')
    //let timestamp = new Date().getTime()
    //newTier.id = (timestamp*parseInt(clr.split("#")[1],16)).toFixed(3).toString().replace(".",'')
    let tierTitle = document.createElement("div")
    tierTitle.className = "tier-title"
    tierTitle.style.backgroundColor = clr
    tierTitle.setAttribute("ondblclick",`rmv_tier('${title}')`)
    let trueTierTitle = document.createElement("div")
    trueTierTitle.className = "tier-title-text"
    trueTierTitle.innerText = title
    let tierContent = document.createElement("div")
    tierContent.className = "tier-content"
    /*tierContent.setAttribute("ondragover",'allowDrop(event)')
    tierContent.setAttribute("ondrop",'drop_handler(event)')
    tierContent.setAttribute("ondblclick",`rmv_tier('${title}')`)*/

    tierTitle.append(trueTierTitle)
    newTier.append(tierTitle)
    newTier.append(tierContent)
    tierList.appendChild(newTier)

    try {
        document.getElementById('newtier').value = ""
        document.getElementById('newcolor').value = ""
    } catch {
        console.log("Controls Disabled");
    }

    tiers_for_linking.push([title,clr,tiers_for_linking.length])
    rescale_tiers()
}

function rmv_tier(title){
    let match_index = 0;
    for(var j = 0; j < tierList.children.length; j++){
        if(tierList.children[j].children[0].children[0].innerText === title){
            tierList.removeChild(tierList.children[j])
            match_index = j;
            break;
        }
    }

    j = 0;
    tiers_for_linking.forEach(item => {
        if (item[0] == title){
            tiers_for_linking.splice(j,1)
        }
        j += 1
    })

    rescale_tiers()
}

function rescale_tiers(){
    if(tierList.children.length >= 9){
        document.documentElement.style.setProperty('--boxes','70px')
    }else if(tierList.children.length >= 8){
        document.documentElement.style.setProperty('--boxes','80px')
    }else if(tierList.children.length >= 7){
        document.documentElement.style.setProperty('--boxes','90px')
    }else{
        document.documentElement.style.setProperty('--boxes','100px')
    }

    let mathed = ((Math.floor(1300/Number(document.documentElement.style.getPropertyValue("--boxes").split("px")[0]))-1)*Number(document.documentElement.style.getPropertyValue("--boxes").split("px")[0])+2).toString()+"px"
    document.documentElement.style.setProperty("--tierwidth",mathed)
}

function read_url(){
    let url = window.location.search
    if (url == ""){return}
    let params = url.slice(url.indexOf("?"),url.length)

    let image_links = []
    while(params.indexOf("&tcimg=") > -1){
        image_links.push(params.split("&tcimg=")[1].split("&tc")[0])
        params = params.replace(`&tcimg=${image_links[image_links.length-1]}`,'')
    }
    console.log(`Got ${image_links.length} images from URL`,image_links)
    for (var j = 0; j < image_links.length; j++){
        addimg('link',image_links[j])
    }
    //images_for_linking = image_links


    let tiers = []
    while(params.indexOf("&tctier=") > -1){
        let whole = params.split("&tctier=")[1].split("&tc")[0]
        let both = whole.split("+")
        both[0] = both[0].replace("%20"," ")
        both[1] = "#"+both[1]
        both[2] = tiers.length
        tiers.push(both)
        params = params.replace(`&tctier=${whole}`,'')
    }
    console.log(`Got ${tiers.length} tiers from URL`,tiers)
    if (tiers.length > 0) {
        default_tiers = tiers
    }


    if (params.includes("&tcfixed")){
        document.getElementById("controls").remove()
    }

    

}



read_url()
for(var i = 0; i < default_tiers.length; i++){
    add_tier(default_tiers[i][0],default_tiers[i][1])
}

function allowDrop(eve){
    eve.preventDefault()
}

function drag(eve){
    eve.dataTransfer.setData("text",eve.target.id)
}

function drop_handler(eve){
    eve.preventDefault()
    var src_img = document.getElementById(eve.dataTransfer.getData("text"))
    
    //console.log(Array.from(eve.target.parentElement.children))
    if (eve.target.tagName == "IMG"){
        eve.target.parentElement.insertBefore(src_img,eve.target)
    }else if(eve.target.className == "tier-content"){
        eve.target.append(src_img)
    }else if(eve.target.className == "tier"){
        eve.target.children[1].append(src_img)
    }
}

function prompt_addition(){
    document.getElementById("adding_wrapper").style.display = "flex"
}

function unprompt(){
    document.getElementById("adding_wrapper").style.display = "none"
}



async function addimg(style,src,hover){

    image_count += 1
    let newIMG = document.createElement("img")
    newIMG.id = "img"+image_count
    newIMG.setAttribute("ondragstart",'drag(event)')
    newIMG.setAttribute("draggable",'true')
    newIMG.setAttribute("ondrop",'drop_handler(event)')
    newIMG.setAttribute("referrerpolicy","no-referrer")
    if (hover){ newIMG.setAttribute("title",hover.toString())}
    //newIMG.setAttribute("ondblclick",`addimg('link','${src}');document.getElementById('${newIMG.id}').remove()`)

    if(style == "link"){
        await loadImageFromBlob('https://corsproxy.io/?'+encodeURIComponent(src)).then((value) => {
            newIMG.setAttribute("src",value.src)
        })


        images_for_linking.push(src)


    }else if(style == "source"){
        newIMG.setAttribute("src",src)


    }else if(style=="file"){
        for(var i = 0; i < document.getElementById("img-file").files.length; i++){
            var reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                addimg("source",imageDataUrl);
            };      
            //console.log(document.getElementById("img-file").files[i])
            reader.readAsDataURL(document.getElementById("img-file").files[i])
        }
        return


    }else if (style == "input"){
        if (document.getElementById("img-link").value != ""){
            //console.log(document.getElementById("img-link").value)
            addimg('link',document.getElementById("img-link").value)
            document.getElementById("img-link").value = ""
        }
        if (document.getElementById("img-file").files.length > 0){
            //console.log(document.getElementById("img-file").files.length)
            addimg("file")
            document.getElementById("img-file").value = ""
        }

        return
    }

    unprompt()
    imgeList.append(newIMG)
}




document.getElementById("tier-list").addEventListener("contextmenu",e => {
    e.preventDefault()
    let contextmenu = document.getElementById("export-image")
    //alert(e.clientX)
    contextmenu.style.display = "block"
    contextmenu.style.marginLeft = e.clientX-10+"px"
    contextmenu.style.marginTop = e.clientY-10+"px"
})

document.getElementById("export-image").addEventListener("mouseleave", e=> {
    document.getElementById("export-image").style.display = "none"
})


async function loadImageFromBlob(url) {
    return new Promise((resolve, reject) => {
  
      window.fetch(url)
        .then(resp => resp.blob())
        .then(blob => {
          const urlFromBlob = window.URL.createObjectURL(blob);
  
          const image = new window.Image()
          image.src = urlFromBlob;
          image.crossOrigin = 'Anonymous';
          image.addEventListener('load', () => {
            resolve(image);
          })
          image.addEventListener('error', reject);
  
        }).catch(error =>{
            throw error;
        })
  
    })
}


function urlify(){
    let full = window.location.href
    prefix = (full+"?").split("?")[0]
    //console.log(prefix)

    let url_additions = ""

    for(var i = 0; i < tiers_for_linking.length; i++){
        url_additions += "&tctier="+tiers_for_linking[i][0]+"+"+tiers_for_linking[i][1].split("#")[1]
    }

    for(var i = 0; i < images_for_linking.length; i++){
        url_additions += "&tcimg="+images_for_linking[i]
    }

    //"&tcfixed"

   
    if (document.getElementById("allow_editing").checked){
        url_additions += "&tc"
    }else{
        url_additions += "&tcfixed"
    }

    //document.getElementById("controls").innerHTML += "<br>"
    //document.getElementById("controls").innerHTML += prefix+"?"+url_additions+"&tc"
    try {
        navigator.clipboard.writeText(prefix+"?"+url_additions);
        console.log('Content copied to clipboard');
        alert("Copied Permalink to clipboard!")
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}


Element.prototype.remove = function() {
    this.parentElement.removeChild(this)
}



function makepng(){
   
    document.documentElement.style.setProperty("--boxes","200px")
    let max_in_row = 12
    let boxes = Number(document.documentElement.style.getPropertyValue('--boxes').split("px")[0])
    let counts = document.getElementsByClassName("tier-title-text")

    for (var x = 0; x < counts.length; x++) {
        counts[x].style.position = `fixed`
        let offset = Math.round(counts[x].parentElement.offsetHeight/boxes)*boxes
        console.log(counts[x].innerText,offset)
        if(offset == boxes){
            offset *= 2
        }else{
            offset = offset/1.5
        }
        counts[x].style.setProperty("padding-top",`${offset}px`)
    }

    window.scrollTo(0,0)
    
    //document.documentElement.style.setProperty("--tierwidth","1920px")
    tierList.style.height = "fit-content"
    tierList.style.minWidth = boxes*max_in_row+10+"px"
    tierList.style.overflowY = "hidden"
    html2canvas(tierList,{allowTaint: true, useCORs: true}).then(canvas => {
        let image = canvas.toDataURL("jpg")
        
        window.open(image,`_blank`)
        //document.getElementById("img-output").appendChild(canvas)
        //document.getElementById("img-output").removeChild(document.getElementById("img-output").firstChild)
    }).then(() => {
        rescale_tiers()
    })

    //rescale_tiers()
    tierList.style.minWidth = "400px"
    //tierList.style.overflowY = "scroll"
    
    for (var x = 0; x < counts.length; x++) {
        counts[x].style.position = ``
        counts[x].style.paddingTop = `0`
    }
    
}
