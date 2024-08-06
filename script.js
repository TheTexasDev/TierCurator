/**let compressedData = pako.gzip();
console.log(compressedData.toString())
let uncompress = pako.ungzip(compressedData,{to:"string"})
console.log(uncompress)**/

var image_count = 0
var default_tiers = [
    ["S","#644cee",0],
    ["A","#48a1ca",1],
    ["B","#56f3a5",2],
    ["C","#c4f356",3],
    ["D","#ffc72c",4],
    ["F","#da5e3f",5]
]
var allow_controls = true


let tierList = document.getElementById("tier-list")
let imgeList = document.getElementById("images")

let tiers_for_linking = []
let images_for_linking = []


function create_new_tier(){
    let tier_name = document.getElementById('newtier').value
    let color = document.getElementById('newcolor').value
    if (tier_name.length < 1){
        alert("Tier has no title")
        return
    }
    

    let colorR = color.slice(1,3)
    let colorG = color.slice(3,5)
    let colorB = color.slice(5,7)
    if (parseInt(colorR,16) <= 30 && parseInt(colorG,16) <= 30 && parseInt(colorB,16) <= 30){
        if ((colorR >= colorG && colorR > colorB) || (colorR > colorG && colorR >= colorB)){
            color = "#"+(50).toString(16)+colorG+colorB
        }else if ((colorG >= colorR && colorG > colorB) || (colorG > colorR && colorG >= colorB)){
            color = "#"+colorR+(50).toString(16)+colorB
        }else if ((colorB >= colorR && colorB > colorG) || (colorB > colorR && colorB >= colorG)){
            color = "#"+colorR+colorG+(50).toString(16)
        }else{
            color = "#282828"
        }
    }

    
    add_tier(tier_name,color)
}

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

    try{
        
        document.getElementById('newtier').value = ""
        document.getElementById('newcolor').value = ""
    }catch{
        console.log("controls disabled")
    }

    tiers_for_linking.push([title,clr,tiers_for_linking.length])
    rescale_tiers()
}

function rmv_tier(title){
    if (!allow_controls){
        return; // controls disabled
    }

    let match_index = 0;
    for(var j = 0; j < tierList.children.length; j++){
        if(tierList.children[j].children[0].children[0].innerText === title){
            let tier_icons = tierList.children[j].children[1].children
            for(var i = 0; i < tier_icons.length; i++){
                //console.log(tier_icons[i].id)
                rmvimg(tier_icons[i].id)
            }
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

function read_url(actually_do_it){
    actually_do_it = actually_do_it || true

    let url = window.location.search
    if (url == ""){return}
    let params = url.slice(url.indexOf("?")+1,url.length)
    //console.log(params)
    params = pako.ungzip(params.split(","),{to:"string"})
    //console.log(params)

    let image_links = []
    let image_shape = "square"

    while(params.indexOf("&tcimg=") > -1){
        tcimg = params.split("&tcimg=")[1].split("&tc")[0]

        if (tcimg.includes("&sh=")){
            image_shape = tcimg.split("&sh=")[1]
        }
        image_links.push(tcimg.split("&sh=")[0])
        params = params.replace(`&tcimg=${tcimg}`,'')
        if(actually_do_it === true){
            addimg('link',tcimg.split("&sh=")[0],image_shape)
        }else{

        }

    }
    console.log(`Got ${image_links.length} images from URL`,image_links)


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
        document.getElementById("controls").remove();
        allow_controls = false;
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

function reset_tier_list(){
    const img_tag_count = Array.prototype.slice.call( document.getElementsByTagName("img") )
    //console.log(img_tag_count)

    for (let img_deleter = 0; img_deleter < img_tag_count.length; img_deleter++){
        let thisone = img_tag_count[img_deleter]
        if (thisone.parentElement.className == "tier-content"){
            rmvimg(thisone.id)
            //thisone.dispatchEvent(new MouseEvent("dblclick"))
        }
    }
}


async function addimg(style,src,aspect){
    aspect = aspect || "square"
    
    image_count += 1
    let newIMG = document.createElement("img")

    /*
    for (let i = 0; i < image_count; i++){
        if(document.getElementById("img"+i)){
            console.log(i,document.getElementById("img"+i))
        }else{
            console.log(i,"Does not Exist")
            newIMG.id = "img"+i
            break
        }
    }*/

    newIMG.id = "img"+image_count
    
    newIMG.setAttribute("ondragstart",'drag(event)')
    newIMG.setAttribute("draggable",'true')
    newIMG.setAttribute("ondrop",'drop_handler(event)')
    newIMG.setAttribute("referrerpolicy","no-referrer")
    newIMG.setAttribute("ondblclick","rmvimg('"+newIMG.id+"')")
    if (aspect == "freeform"){ 
        newIMG.setAttribute("class","img_freeform")
    }else if(aspect == "circle"){
        newIMG.setAttribute("class","img_circle")
    }else{
        newIMG.setAttribute("class","img_square") 
    }
    

    if(style == "link"){
        await loadImageFromBlob('https://corsproxy.io/?'+encodeURIComponent(src)).then((value) => {
            newIMG.setAttribute("src",value.src)
        })


        newIMG.setAttribute("data-origin-link",src)
        images_for_linking.push(src+"&sh="+aspect)


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
            if(document.getElementById("img-link").value.includes(",")){
                let linebreaks = document.getElementById("img-link").value.split("\n");
                for (var i = 0; i < linebreaks.length; i++){
                    addimg('link',linebreaks[i],document.getElementById("image_aspect_picker").value)
                }
                document.getElementById("img-link").value = ""
                return
            }
            addimg('link',document.getElementById("img-link").value,document.getElementById("image_aspect_picker").value)
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

function rmvimg(id){
    let curn_image = document.getElementById(id)
    let imageparent = curn_image.parentElement

    if(imageparent.className == "image_list"){
        if(!allow_controls){return}
        if(curn_image.hasAttribute("data-origin-link")){
            let stored_value = `${curn_image.getAttribute("data-origin-link")}&sh=${curn_image.className.split("_")[1]}`
            let found_you = images_for_linking.indexOf(stored_value)
            if (found_you > -1){
                images_for_linking.splice(found_you,1)
            }
        }
        imageparent.removeChild(curn_image)

    }else{
        if(curn_image.hasAttribute("data-origin-link")){
            addimg("link",curn_image.getAttribute("data-origin-link"),document.getElementById(id).className.split("_")[1])
        }else{
            addimg("source",curn_image.getAttribute("src"),document.getElementById(id).className.split("_")[1])
        }
        imageparent.removeChild(curn_image)
    }
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


function urlify(actually_do_it){
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

   
    if (document.getElementById("allow_editing").checked){
        url_additions += "&tc"
    }else{
        url_additions += "&tcfixed"
    }

    const old_url = prefix+"?"+url_additions
    const compressed = pako.gzip(url_additions.toString())

    try{
        if (actually_do_it == "old"){
            navigator.clipboard.writeText(old_url);
            alert("Copied decoded (old) url")
            return
        }else if (actually_do_it == "new"){
            navigator.clipboard.writeText(prefix+"?"+compressed);
            alert("Copied pako url")
            return
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
    }

    /* A remnant of my original idea to leave the permalink as plaintext in the controls box. (which stretched it wayyy tf out) 
    I keep it here to shame myself. */
    //document.getElementById("controls").innerHTML += "<br>"
    //document.getElementById("controls").innerHTML += prefix+"?"+url_additions+"&tc"
    try {
        
        navigator.clipboard.writeText(prefix+"?"+compressed);
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

    /*
    Sometimes the Tier Titles are pushed down one tier and leave a blank one on top.
    Or double-tall rows will have the letter not in the middle.
    This is commented out right now because it works perfectly without it. Still here incase it breaks again for magic code reasons.
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
    }*/

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



/* Texan's Pretend-Dev Tools */
function dev_get_tiers(){
    try {
        navigator.clipboard.writeText(JSON.stringify(tiers_for_linking));
        alert("Copied Tiers to clipboard")
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

function dev_get_icons(){
    try {
        navigator.clipboard.writeText(JSON.stringify(images_for_linking));
        alert("Copied Tiers to clipboard")
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}
