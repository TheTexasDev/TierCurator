/**let compressedData = pako.gzip();
console.log(compressedData.toString())
let uncompress = pako.ungzip(compressedData,{to:"string"})
console.log(uncompress)**/

var image_count = 0
var image_loade = 0
var default_tiers = [
    ["S","#644cee",0],
    ["A","#48a1ca",1],
    ["B","#56f3a5",2],
    ["C","#c4f356",3],
    ["D","#ffc72c",4],
    ["F","#da5e3f",5]
]
var default_opposites = [
    "High Skill Floor",
    "High Skill Cap",
    "Low Skill Floor",
    "Low Skill Cap"
]
var changing_opp = 0;
var allow_controls = true
var tier_column_count = 2;


let tierList = document.getElementById("tier-list")
let imgeList = document.getElementById("images")

let tiers_for_linking = []
let images_for_linking = []

const debug_level = 1; // Debug level, if any debug logs are sent with a level less than this one they will be logged




function debug(lvl_threshold,...msgs){
    /*
        a console.log but only if the debug level is greater than the threshold
        < 0 however are always debugged.
    */

    if (msgs.length < 1){ // doesn't include anything except the first parameter automatically sets the threshold to the lowest priority.
        msgs = [lvl_threshold];
        lvl_threshold = 1; 
    }

    if (debug_level < lvl_threshold && !(lvl_threshold < 0)){
        // if the debug level is too low and its not a negative then don't do anything.
       return "Nothing to Debug";
    }



    let output = [];
    let target_position = -1;

    msgs.unshift("\n")
    msgs.forEach(input_val => {
        if (input_val === "\\n" || input_val === "\n"){
            target_position += 1;
            output[target_position] = ""
        }

        if (typeof input_val == "string"){
            output[target_position] += " "+input_val;
        }else if(typeof input_val == "object"){
            output[target_position] += " "+JSON.stringify(input_val)
        }else{
            output[target_position] += " "+input_val.toString();
        }
    })
    
    return `Debug[${lvl_threshold}]:`+output.join("\n");
}


function get_relative_mousepos(ev){
    // get the current mouse position in the browser
    let x = ev.clientX;
    let y = ev.clientY;
    // get the position of the element you applied the handler to
    let pos = ev.target.getBoundingClientRect();
    // subtract the position of the element (rounded up to the next
    // integer) from the mouse position and return it.
    return {
        x: x - pos.x|1,
        y: y - pos.y|1
    };
}


function get_tier_type(){
    const type = ["tier","pyramid","matchup","opposite"][Number(document.getElementById("tier-type").value)]
    return type;
}

function tier_id_gen(){
    const text = "abcdefghijklmnopqrstuvwxyz0123456789ABCDDFGHIJKLMNOPQRSTUVWXYZ";
    const id_length = 5;
    let identifier = ""

    for(var i = 0; i < id_length; i++){
        identifier += text[Math.floor(Math.random()*text.length)-1]
    }

    return identifier;
}

function create_new_tier(){
    let tier_name = document.getElementById('newtier').value
    let color = document.getElementById('newcolor').value

    if (get_tier_type() == "opposite"){
        
        if (tier_name.length > 0) default_opposites[changing_opp] = tier_name;
        changing_opp += 1;
        if (changing_opp > 3){
            changing_opp = 0;
        }

        document.getElementById("opposite-top").innerText = default_opposites[0];
        document.getElementById("opposite-right").innerText = default_opposites[1];
        document.getElementById("opposite-bottom").innerText = default_opposites[2];
        document.getElementById("opposite-left").innerText = default_opposites[3];

        return;
    }

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

    /*
    // Set color input to a random color

    const color_int_options = ["28","40","55","77","99","bb","cc","dd","ee","ff"]
    const COLORGEN = "#"+color_int_options[Math.round(Math.random()*(color_int_options.length-1))].toString()+color_int_options[Math.round(Math.random()*(color_int_options.length-1))].toString()+color_int_options[Math.round(Math.random()*(color_int_options.length-1))].toString();
    //console.log(COLORGEN)
    document.getElementById('newcolor').value = COLORGEN;
    */

    
    add_tier(tier_name,color)
}


function add_tier(title,clr,add_to_tiers){
    const type = get_tier_type();
    if (add_to_tiers !== false){
        add_to_tiers = true;
    }

    let newTier = document.createElement("div")
    newTier.className = "tier";
    newTier.id = tier_id_gen();
    newTier.setAttribute("ondragstart",'drag(event)')
    newTier.setAttribute("ondragover",'allowDrop(event)')
    newTier.setAttribute("ondrop",'drop_handler(event)')
    if(allow_controls !== true){
        newTier.setAttribute("draggable",'false');
    }else{
        newTier.setAttribute("draggable",'true');
    }
    //let timestamp = new Date().getTime()
    //newTier.id = (timestamp*parseInt(clr.split("#")[1],16)).toFixed(3).toString().replace(".",'')
    let tierTitle = document.createElement("div")
    tierTitle.className = "tier-title"
    if (type == "pyramid") tierTitle.className += " pyramid"

    tierTitle.style.backgroundColor = clr
    tierTitle.setAttribute("ondblclick",`rmv_tier('${title}')`)
    let trueTierTitle = document.createElement("div")
    trueTierTitle.className = "tier-title-text"
    trueTierTitle.innerText = title.replace("%20"," ");
    let tierContent = document.createElement("div");
    tierContent.className = "tier-column"
    
    if (type == "pyramid") tierContent.className += " pyramid"
    /*tierContent.setAttribute("ondragover",'allowDrop(event)')
    tierContent.setAttribute("ondrop",'drop_handler(event)')
    tierContent.setAttribute("ondblclick",`rmv_tier('${title}')`)*/

    let paddingdivs = document.createElement("div");
    paddingdivs.className = "column-padding";
    paddingdivs.style.width = ((tier_column_count+3)/tier_column_count)*100+"%";
    //paddingdivs.style.width = "33%";

    tierTitle.append(trueTierTitle)
    if (type == "pyramid") newTier.append(paddingdivs.cloneNode(true))
    newTier.append(tierTitle)

    for(let i = 0; i < tier_column_count; i++){
        newTier.append(tierContent.cloneNode(true))
    }

    if (type == "pyramid") newTier.append(paddingdivs.cloneNode(true))

    
    tierList.appendChild(newTier);

    try{
        
        document.getElementById('newtier').value = ""
        document.getElementById('newcolor').value = ""
    }catch{
        console.log(debug(1,"controls disabled"));
    }

    if (add_to_tiers == true) tiers_for_linking.push([title,clr,tiers_for_linking.length]);
    if (type == "pyramid") tier_column_count += 1;
}


function rmv_tier(title){
    if (!allow_controls){
        return; // controls disabled
    }

    let match_index = 0;
    for(var row = 1; row < tierList.children.length; row++){

        if(tierList.children[row].children[0].children[0].innerText === title){
            for(var column = 1; column < tierList.children[row].children.length; column++){

                let tier_icons = tierList.children[row].children[column].children;
                
                while(tier_icons.length > 0){
                    rmvimg(tier_icons[0].id)
                }
            }
            tierList.removeChild(tierList.children[row])
            match_index = row;
            break;
        }
    }

    j = 0;
    tiers_for_linking.forEach(item => {
        if (item[0] == title){
            tiers_for_linking.splice(j,1)
        }
        j += 1
    });
}


function create_header(){
    const t_type = get_tier_type()
    if (t_type != "tier") return;

    let header_container = document.getElementById("list-header");
    header_container.innerHTML = `<div id="list-corner">Tier Curator</div>`

    let newColumn = document.createElement("div");
    newColumn.className = "tier-column-title";

    
    if (tier_column_count <= 1){
        newColumn.innerText = "";
        header_container.append(newColumn);
        return;
    }

    
    let under_half = Math.floor(tier_column_count/2)
    let exact_half = tier_column_count/2
    let over_half = Math.floor(tier_column_count/2)+1

    for(let i = 0; i < tier_column_count; i++){

        let new_clone = newColumn.cloneNode(true);
        let column_pwr = ""

        if (i < under_half){
            column_pwr = "+".repeat(under_half - i)
        }else if(i >= under_half){
            column_pwr = "-".repeat(over_half - (tier_column_count - i))
        }else{
            column_pwr = "??"
        }

        if (column_pwr == ""){
            column_pwr = "•"
        }

        new_clone.innerText = column_pwr;
        header_container.append(new_clone);
    }
    
}


function adjust_column_count(new_column_count){

    console.log(debug(2,`Target Columns: ${new_column_count} | Current Columns: ${tier_column_count}`))

    for(var row = 1; row < tierList.children.length; row++){
        if (new_column_count > tier_column_count){
            
            let newColumn = document.createElement("div")
            newColumn.className = "tier-column";
            for(let i = tier_column_count; i < new_column_count; i++){
                tierList.children[row].append(newColumn.cloneNode(true))
            }

            continue;
        }

        let active_columns = tierList.children[row].children
        for(let column = tier_column_count; active_columns.length > new_column_count+1; column--){ // the tier titles count as a column programatically so pretend we need an extra

            let tier_icons = active_columns[column].children;
            
            while(tier_icons.length > 0){
                if (rmvimg(tier_icons[0].id) == null){
                    break;
                }
            }

            tierList.children[row].removeChild(tierList.children[row].children[column]);
        }
    }
}


async function load_presets_from_github(){
    const preset_source_file = "https://raw.githubusercontent.com/TheTexasDev/TierCurator/refs/heads/main/examples.presets.txt";
    let preset_list = [];

    await fetch(preset_source_file).then(r => r.text()).then(text => {
        preset_list = text.split("\n");
    });

    while(preset_list[preset_list.length-1] == ""){
        preset_list.pop() // remove empty space
    }

    console.log(debug(3,preset_list))

    for(var i = 0; i < preset_list.length; i++){
        let current = preset_list[i]
        let title = current.split(":")[0];
        let link_to = "https:"+current.split(":")[2];

        let new_wrapper = document.createElement("div");
        new_wrapper.className = "preset-selection";

        let new_anchor = document.createElement("a");
        new_anchor.href = link_to;
        new_anchor.target = "_blank";
        new_anchor.innerText = title;

        new_wrapper.appendChild(new_anchor)

        document.getElementById("presets-list").appendChild(new_wrapper);
    }
}


function read_url(actually_do_it){
    actually_do_it = actually_do_it || true

    let url = window.location.search
    if (url == ""){
        tierlistinate();
        return;
    }
    let params = url.slice(url.indexOf("?")+1,url.length)
    //console.log(params)
    if(!params.includes("&tc")){
        params = pako.ungzip(params.split(","),{to:"string"})
    }
    //console.log(params)

    let t_type = "tier";
    if (params.includes("&tctype")){
        t_type = params.split("&tctype=")[1].split("&tc")[0];
    }
    

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
    console.log(debug(3,`Got ${image_links.length} images from URL`,image_links))


    let tiers = []

    let start = 0;
    while(params.indexOf("&tctier=") > -1){
        if (t_type == "opposite"){

            if (start > 3){
                break;
            }
            default_opposites[start] = params.split("&tctier=")[1].split("&tc")[0];
            params = params.replace(`&tctier=${default_opposites[start]}`,'')
            start++;

        }else{

            let whole = params.split("&tctier=")[1].split("&tc")[0]
            let both = whole.split("+")
            both[0] = both[0].replace("%20"," ")
            both[1] = "#"+both[1]
            both[2] = tiers.length
            tiers.push(both)
            params = params.replace(`&tctier=${whole}`,'')
        }
    }

    console.log(debug(1, `Got ${tiers.length} tiers from URL`,tiers))

    
    if (tiers.length > 0) {
        default_tiers = tiers
    }

    if(t_type == "tier" && params.includes("&tccolumns=")){
        document.getElementById("column-count").value = params.split("&tccolumns=")[1].split("&tc")[0];
    }

    if (params.includes("&tcfixed")){
        document.getElementById("controls-modifiers").remove();
        document.getElementById("allow_editing").checked = false;
        document.getElementById("allow_editing").disabled = true;
        allow_controls = false;
    }

    if (t_type == "opposite"){
        oppositize()
    }else if (t_type == "pyramid"){
        pyramidify()
    }else{
        console.log(debug(1, "No list type was specified in url, defaulting to Tier List."))
        tierlistinate()
    }

    document.getElementById("tier-type").value = ["tier","pyramid","matchup","opposite"].indexOf(t_type).toString()
    tier_column_count = Number(document.getElementById("column-count").value);
    
}



read_url()
create_header()
for(var i = 0; i < default_tiers.length; i++){
    add_tier(default_tiers[i][0],default_tiers[i][1]);
}
load_presets_from_github()


function allowDrop(eve){
    eve.preventDefault()
}



function drag(eve){
    if (get_tier_type() == "opposite"){
        document.getElementById("graph-screen").style.zIndex = 20; // Make the screen layer higher than the elements
    }
    eve.dataTransfer.setData("text",eve.target.id);
}


function drop_handler(eve){
    eve.preventDefault()
    var src_element = document.getElementById(eve.dataTransfer.getData("text"));
    
    //console.log(Array.from(eve.target.parentElement.children))
    if(src_element.className == "tier"){
        // Moving a tier row
        let element_of_hovered = null; // the div of the target row
        let position_of_grabbed = 0;
        let row_to_displace = null; // the index of the target row
        
        if(eve.target.className == "tier-title"){
            element_of_hovered = eve.target.parentElement;

        }else if(eve.target.className == "tier-title-text"){
            element_of_hovered = eve.target.parentElement.parentElement;
            //element_of_hovered.parentElement.insertBefore(src_element,element_of_hovered);

        }else{
            //console.log(eve.target)
            return
        }
        
        row_to_displace = Array.prototype.slice.call(element_of_hovered.parentElement.children).indexOf(element_of_hovered);
        position_of_grabbed = Array.prototype.slice.call(element_of_hovered.parentElement.children).indexOf(src_element);

        if (row_to_displace > 0){
            if (position_of_grabbed < row_to_displace){
                // Hovering over any row underneath the grabbed row
                // place the src_element row BELOW the target
                element_of_hovered.parentElement.insertBefore(src_element,element_of_hovered.nextSibling);

            }else{
                // hovering over any row above the grabbed row
                // place the src_element row above the target row 
                element_of_hovered.parentElement.insertBefore(src_element,element_of_hovered);
            }
        }


    }else if (eve.target.tagName == "IMG"){
        const dropcolumn = eve.target.parentElement
        if (dropcolumn.className.includes("pyramid")){
            return;
        }

    }else if(eve.target.className.includes("tier-column")){
        if (eve.target.className.includes("pyramid")){
            if (eve.target.children.length < 1){
                eve.target.append(src_element);
            }else{
                return;
            }

        }else{
            eve.target.append(src_element);
        }

    }else if(eve.target.id == "graph-screen"){

        src_element.style.position = "absolute";
        let x_pos = get_relative_mousepos(eve)["x"] - (Number(src_element.width)/2);
        let y_pos = get_relative_mousepos(eve)["y"] - (Number(src_element.height)/2);
        src_element.style.left = x_pos+"px";
        src_element.style.top = y_pos+"px";

        //document.getElementById("controls-modifiers").innerText = "x:"++" y:"+get_relative_mousepos(eve)["y"]
        document.getElementById("full-graph").append(src_element);
        document.getElementById("graph-screen").style.zIndex = 10; // reset layer position

    }else if(eve.target.className == "tier"){
        eve.target.children[1].append(src_element)
    }
}

function prompt_addition(){
    document.getElementById("adding_wrapper").style.display = "flex"
}

function unprompt(){
    document.getElementById("adding_wrapper").style.display = "none"
}


function prompt_output(){
    document.getElementById("output_image_wrapper").style.display = "flex"
}

function unoutput(){
    document.getElementById("output_image_wrapper").style.display = "none"
}


function reset_tier_list(){
    //console.log("Resetting List....")
    const img_tag_count = Array.prototype.slice.call( document.getElementsByTagName("img") )
    console.log(debug(3,"Images to Delete: ", img_tag_count))

    for (let img_deleter = 0; img_deleter < img_tag_count.length; img_deleter++){
        let thisone = img_tag_count[img_deleter]
        // move ANY image that has the id "img#" and isn't in the icon list 
        if (thisone.parentElement.className != "image_list" && thisone.id.match(/img(\d)+/)){

            rmvimg(thisone.id);
        }
    }
}


async function addimg(style,src,aspect){
    aspect = aspect || "square"
    
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

    newIMG.id = "img"+image_count;
    newIMG.id = (newIMG.id).replace("'","\\'");
    // Add attributes to the new image
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
        let fetch_proxy = document.querySelector("input[name='proxy']:checked").value

        const proxies = [
            'https://corsproxy.io/?url=',
            'https://api.cors.lol/?url=',
            'http://fuck-cors.com/?url=',
            'https://crossorigin.me/',
            'http://www.corsify.me/'

        ];

        if (src.includes("\n")){
            // if line breaks are present then separate them and loop through each one
            let individual_lines = src.split("\n")
            for (const individual_link of individual_lines){
                if (individual_link != ""){
                    console.log(debug(2,individual_link))
                    addimg("link",individual_link,document.getElementById("image_aspect_picker").value)
                }else{
                    console.log(debug(2,"Import line is blank"))
                }
            }
            return;

        }else{
            image_count += 1;


            if (fetch_proxy == "noproxy"){
                await loadImageFromBlob(encodeURIComponent(src)).then((value) => {
                    newIMG.setAttribute("src",value.src)
                    image_loade += 1
                });

            }else{
                let break_flag = false;
                for(const curn_proxy of proxies){ // loop through all proxies.
                    if (break_flag){
                        break;
                    }
                    try {

                        await loadImageFromBlob(curn_proxy+encodeURIComponent(src)).then((value) => {
                            newIMG.setAttribute("src",value.src)
                            image_loade += 1
                        }).then(() => {
                            break_flag = true;
                        })

                    }catch(e){
                        console.log(debug(3,`${curn_proxy}: Failed to find '${src}'`))
                        break_flag = false;
                    }
                }

            }
        }

        newIMG.setAttribute("data-origin-link",src)
        images_for_linking.push(src+"&sh="+aspect)


    }else if(style == "source"){
        newIMG.setAttribute("src",src,aspect)
        image_count += 1
        image_loade += 1

    }else if(style == "file"){
        for(var i = 0; i < document.getElementById("img-file").files.length; i++){
            var reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                addimg("source",imageDataUrl,document.getElementById("image_aspect_picker").value);
            };      
            //console.log(document.getElementById("img-file").files[i])
            reader.readAsDataURL(document.getElementById("img-file").files[i])
        }

        return;


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
        return;

    }

    unprompt()
    imgeList.append(newIMG)
    document.getElementById("image-counter-loaded").innerText = image_loade
    document.getElementById("image-counter-fromlink").innerText = image_count

    if(image_loade == image_count){
        setTimeout(() =>{
            document.getElementById("check_loaded_images").style.display = "none";
        },1000);
    }
}


function rmvimg(id){
    let curn_image = document.getElementById(id)
    if (curn_image == null){
        return null;
    }
    let imageparent = curn_image.parentElement;

    if(imageparent.className == "image_list"){
        if(!allow_controls){return}
        if(curn_image.hasAttribute("data-origin-link")){
            // remove link from the template json
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


document.getElementById("tier-list").addEventListener("contextmenu", e => {
    e.preventDefault();
})


document.getElementById("column-count").addEventListener('change', e => {
    new_count = Number(document.getElementById("column-count").value);
    adjust_column_count(new_count)

    tier_column_count = new_count;
    create_header()
})


document.getElementById("newcolor").addEventListener('change', e => {
    if (get_tier_type() == "opposite"){
        //console.log(debug(3,document.getElementById("newcolor").value))
        document.getElementById("full-graph").style.backgroundColor = document.getElementById("newcolor").value;
    }
});



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
            console.log(debug(-1,`Cannot resolve link "${url}"`))
            return false;
        })
  
    })
}


function urlify(actually_do_it){
    let full = window.location.href
    prefix = (full+"?").split("?")[0]
    //console.log(prefix)
    const t_type = get_tier_type();

    let url_additions = ""
    url_additions += "&tctype="+t_type;
    
    if(t_type == "tier") url_additions += "&tccolumns="+document.getElementById("column-count").value

    if (t_type == "tier" || t_type == "pyramid"){
        for(let i = 0; i < tiers_for_linking.length; i++){
            url_additions += "&tctier="+tiers_for_linking[i][0]+"+"+tiers_for_linking[i][1].split("#")[1]
        }

    }else if (t_type == "opposite"){
        url_additions += "&tctier="+default_opposites[0]
        url_additions += "&tctier="+default_opposites[1]
        url_additions += "&tctier="+default_opposites[2]
        url_additions += "&tctier="+default_opposites[3]

    }


    // Add the Icons to the Permalink
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
        console.log(debug(1,'Content copied to clipboard'))
        alert("Copied Permalink to clipboard!")
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}


Element.prototype.remove = function() {
    this.parentElement.removeChild(this)
}



function makepng(){
    const t_type = get_tier_type()

    if (t_type != "opposite") document.documentElement.style.setProperty("--boxes","200px");
    //document.documentElement.style.setProperty("--tierwidth","fit-content")
    //let max_in_row = 12
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
    
    if (t_type !== "opposite"){
        //document.documentElement.style.setProperty("--tierwidth","1920px")
        tierList.style.height = "fit-content"
        //tierList.style.minWidth = boxes*max_in_row+10+"px"
        tierList.style.width = "fit-content";
        tierList.style.minWidth = "fit-content";
        tierList.style.overflowY = "hidden"
    }
    html2canvas(tierList,
        {
            allowTaint: true, 
            useCORs: true,
            backgroundColor: null,
            imageTimeout: 15000

        }).then(canvas => {
        let image = canvas.toDataURL("jpg");
        
        document.getElementById("download-link").href = image;
        document.getElementById("output_image_data").src = image;
        prompt_output()
        //document.getElementById("img-output").appendChild(canvas)
        //document.getElementById("img-output").removeChild(document.getElementById("img-output").firstChild)
    }).then(() => {
    })
    
    //tierList.style.overflowY = "scroll"
    
    document.documentElement.style.setProperty("--boxes","100px");
    tierList.style.width = "var(--tierwidth)";

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



/* Tier list type changing stuff */
function tier_change(){
    const t_type = get_tier_type();
    console.log(debug(3,"Got Tier Type: ",t_type,"type: ",typeof t_type))
    reset_tier_list();
    console.log(debug(4,"Resetted List"))

    if (t_type == "tier"){
        console.log(debug(2,"Convert to Tier List"))
        tierlistinate()

    }else if (t_type == "pyramid"){
        console.log(debug(2,"Convert to Pyramid"))
        pyramidify()
        
    }else if (t_type == "opposite"){
        console.log(debug(2,"Convert to Opposite"))
        oppositize()
    } else {
        console.log(debug(2,"No target to change list to"))
    }
}

function tierlistinate(){
    document.getElementById("column-count").disabled = false;
    tierList.className = ""
    tierList.innerHTML = "<div id='list-header'></div>"

    tier_column_count = 2;
    
    create_header();

    for(var i = 0; i < tiers_for_linking.length; i++){
        add_tier(tiers_for_linking[i][0],tiers_for_linking[i][1],false);
    }
    
    adjust_column_count(tier_column_count);
    document.getElementById("column-count").value = 2;

    /* Dialog Tutorial Changes */
    document.getElementById("dialog_add_tier").innerHTML = "To create a new tier simply <b>press Add Tier</b> and it will use the selected color from the option next to it you also <i>need a tier name</i> by typing it into the textbox."
}


function pyramidify(){
    tierList.innerHTML = "<div id='list-header'></div>"
    tierList.className = "pyramid"

    tier_column_count = 1

    for(var i = 0; i < tiers_for_linking.length; i++){
        add_tier(tiers_for_linking[i][0],tiers_for_linking[i][1],false);
    }

    document.getElementById("column-count").value = 1;
    document.getElementById("column-count").disabled = true;
    document.getElementById('list-header').innerHTML = "<div id='list-center'>TierCurator</div>"

    //adjust_column_count(1);
    tier_column_count = tierList.children.length;
    //adjust_column_count(tier_column_count);


    /* Dialog Tutorial Changes */
    document.getElementById("dialog_add_tier").innerHTML = "To create a new tier simply <b>press Add Tier</b> and it will use the selected color from the option next to it you also <i>need a tier name</i> by typing it into the textbox."
}


function oppositize(){
    tierList.className = ""
    document.getElementById("column-count").value = 4;
    document.getElementById("column-count").disabled = true;
    document.getElementById("newcolor").value = "#181818";
    tierList.innerHTML = "<div id='full-graph'></div>";

    let area = document.createElement("div")
    area.id = 'graph-screen'
    area.setAttribute("ondragstart",'drag(event)')
    area.setAttribute("ondragover",'allowDrop(event)');
    area.setAttribute("ondrop",'drop_handler(event)');
    tierList.append(area);
    

    let horizontal_line = document.createElement("div");
    horizontal_line.className = "horizontal-line";
    let vertical_line = document.createElement("div");
    vertical_line.className = "vertical-line";

    let top_opp = document.createElement("div");
    top_opp.id = "opposite-top";
    top_opp.innerText = default_opposites[0]

    let right_opp = document.createElement("div");
    right_opp.id = "opposite-right";
    right_opp.innerText = default_opposites[1]

    let bottom_opp = document.createElement("div");
    bottom_opp.id = "opposite-bottom";
    bottom_opp.innerText = default_opposites[2]

    let left_opp = document.createElement("div");
    left_opp.id = "opposite-left";
    left_opp.innerText = default_opposites[3]

    
    document.getElementById("full-graph").appendChild(horizontal_line.cloneNode(true))
    document.getElementById("full-graph").appendChild(vertical_line.cloneNode(true))
    document.getElementById("full-graph").appendChild(top_opp)
    document.getElementById("full-graph").appendChild(right_opp)
    document.getElementById("full-graph").appendChild(bottom_opp)
    document.getElementById("full-graph").appendChild(left_opp)

     /* Dialog Tutorial Changes */
     document.getElementById("dialog_add_tier").innerHTML = "Changing the <b>tier title</b> will change the top scale. Changing it again will change the right scale, then bottom, then left, then back to the top scale."
}
