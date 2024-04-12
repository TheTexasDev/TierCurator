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

    let mathed = ((Math.floor(1000/Number(document.documentElement.style.getPropertyValue("--boxes").split("px")[0]))-1)*Number(document.documentElement.style.getPropertyValue("--boxes").split("px")[0])+2).toString()+"px"
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
    images_for_linking = image_links


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



function addimg(style,src){

    image_count += 1
    let newIMG = document.createElement("img")
    newIMG.id = "img"+image_count
    newIMG.setAttribute("ondragstart",'drag(event)')
    newIMG.setAttribute("draggable",'true')
    newIMG.setAttribute("ondrop",'drop_handler(event)')
    newIMG.setAttribute("referrerpolicy","no-referrer")
    //newIMG.setAttribute("ondblclick",`addimg('link','${src}');document.getElementById('${newIMG.id}').remove()`)

    if(style == "link"){
        loadImageFromBlob('https://corsproxy.io/?'+encodeURIComponent(src)).then(value => {
            newIMG.setAttribute("src",value.src)
        })

        images_for_linking.push(document.getElementById("img-link").value)
        document.getElementById("img-link").value = ""
    }else if(style=="file"){
        
        for(var i = 0; i < document.getElementById("img-file").files.length; i++){
            var reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                addimg("url",imageDataUrl);
            };      
            //console.log(document.getElementById("img-file").files[i])
            reader.readAsDataURL(document.getElementById("img-file").files[i])
        }
        
        return
    }

    
    unprompt()
    imgeList.append(newIMG)
}





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
  
        })
  
     })
  
  }

function url2base(img){
    //let invisimage = document.createElement("img")
    //let loader = loadImageFromBlob(img)
    //console.log(loader)
    //invisimage.setAttribute("src",loader)
    //document.body.append(invisimage)
    /*console.log(invisimage)
    var canvo = document.createElement("canvas");
    canvo.width = invisimage.width;
    canvo.height = invisimage.height;
    var ctx = canvo.getContext("2d");
    ctx.drawImage(invisimage, 0, 0);
    var dataURL = canvo.toDataURL("image/png");
    console.log(dataURL)
    return dataURL.replace(/^data:image\/?[A-z]*;base64,/,'');*/
    return img
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

    document.getElementById("controls").innerHTML += "<br>"
    document.getElementById("controls").innerHTML += prefix+"?"+url_additions+"&tc"
}


Element.prototype.remove = function() {
    this.parentElement.removeChild(this)
}



function makepng(){
   /* 
    I am attempting to be able to convert a tier list into an image and have run into an issue
    when using html2canvas. The tier titles, 'tier-title-text' are all moved back by one. So the first tier is the second one and the last tier has no name 
    
    Method A: Force Positioning
    - Move the letters down a peg. I used fixed positioning and scrolling back to top of page to achieve this. Bit janky but it works. 
    - Everything is returned to position after the fact

    Method B: Push Tiers
    - Go through all the tiers and move the title to the next one down.
    */ 





    /* Method A Pre-image */
    
    
    let boxes = Number(document.documentElement.style.getPropertyValue('--boxes').split("px")[0])
    let counts = document.getElementsByClassName("tier-title-text")
    for (var x = 0; x < counts.length; x++) {
        counts[x].style.position = `fixed`
        let offset = Math.round(counts[x].parentElement.offsetHeight/100)*100
        console.log(counts[x].innerText,offset)
        if(offset == boxes){
            offset *= 2
        }else{
            offset = offset/1.5
        }
        counts[x].style.setProperty("padding-top",`${offset}px`)
    }

    window.scrollTo(0,0)
    
    

    /* Method B Pre-image */
    /*
    let faketier = document.createElement("div")
    faketier.className = "tier"
    faketier.style.setProperty("margin-bottom",`calc(var(--boxes))`);
    faketier.style.setProperty("position",`absolute`);
    let tierTitle = document.createElement("div")
    tierTitle.className = "tier-title"
    tierTitle.style.border="none"
    let lieTierTitle = document.createElement("div")
    lieTierTitle.className = "tier-title-text"
    let tierContent = document.createElement("div")
    tierContent.className = "tier-content"
    tierContent.style = "border:none;"
    
    tierTitle.append(lieTierTitle)
    faketier.append(tierTitle)
    faketier.append(tierContent)
    tierList.append(faketier)

    let counts = document.getElementsByClassName("tier-title-text")
    console.log(counts)
    for (var x = counts.length-1; x > 0; x--) {
        counts[x].innerText = counts[x-1].innerText
    }*/
    

    tierList.style.height = "fit-content"
    tierList.style.overflowY = "hidden"
    html2canvas(tierList,{allowTaint: true, useCORs: true}).then(canvas => {
        let image = canvas.toDataURL()
        
        document.getElementById("img-output").appendChild(canvas)
        document.getElementById("img-output").removeChild(document.getElementById("img-output").firstChild)
    })
    //tierList.style.height = ""
    //tierList.style.overflowY = "scroll"

    /* Method B Post-image */
    /*
    for (var x = 0; x < counts.length-1; x++) {
        counts[x].innerText = counts[x+1].innerText
    }
    tierList.removeChild(tierList.lastChild)*/

    
    /* Method A Post-image */
    
    for (var x = 0; x < counts.length; x++) {
        counts[x].style.position = ``
        counts[x].style.paddingTop = `0`
    }
    
    
}