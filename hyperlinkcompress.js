
var udc = 1
function debug(...text){
	console.log(`DEBUG ${udc}:\t`,text.join(" "))
	udc += 1
}

var prefix_ref = ["https://","http://","https://www.","http://www."]
var filetype_ref = ["","jpg","png","webp","pdf","txt","avif"]
var domain_ref = [".com",".org",".net",".lol",".xyz",".gov",".gallery"]

const singledigencode = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"



String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function replaceAllExceptFirst(str, search, replacement) {
	const firstIndex = str.indexOf(search);
	if (firstIndex === -1) return str; // not found

	
	let result = str.slice(0, firstIndex + search.length);
	let remaining = str.slice(firstIndex + search.length);
	//debug(result,remaining)
	
	// Replace all remaining occurrences
	remaining = remaining.split(search).join(replacement);
	
	return result + remaining;
}

function baseURLEncode(baseURL){
	return btoa(baseURL).replace(/\+/g,"-").replace(/\//g,"_").replace(/\=/g,"");
}

function baseURLDecode(baseURL){
	return atob(baseURL).replace(/-/g,"+").replace(/_/g,"/");
}


/* 
	Reference Code:

	&A		'assets'
	&a
	&B		'blog'
	&b
	&C		'content'
	&c		'crop'
	&D
	&d		'cdn.'
	&E
	&e
	&F		'format='
	&f		'f='
	&G
	&g
	&H
	&h
	&I		'img'
	&i		'img.'
	&J
	&j
	&K
	&k
	&L
	&l
	&M		'media'
	&m		'media.'
	&N
	&n
	&O		'width'
	&o		'height'
	&P
	&p		'preview.'
	&Q		
	&q
	&R
	&r
	&S
	&s		'static.'
	&T
	&t
	&U
	&u
	&V
	&v		reference to filetype
	&W
	&w		'wiki.'
	&X
	&x
	&Y
	&y
	&Z
	&z
	&Is		'images'

	&aw		's3.amazonaws.'
	&nck	'static.wikia.nocookie.'
*/
function HLCompress(hyperlink){
	let modifiable = hyperlink;
	let output = "0000";

	if (modifiable.startsWith("https://www.")){
		output = output.replaceAt(0,"2")
	}else if (modifiable.startsWith("http://www.")){
		output = output.replaceAt(0,"3")
	}else if(modifiable.startsWith("http://")){
		output = output.replaceAt(0,"1")
	}else if(!modifiable.startsWith("https://")){
		throw new Error("HL Doesn't begin with 'http' or secure")
	}

	//modifiable = modifiable.replace(/http:\/\//gi,"1");
	let domain = hyperlink.split(/https?:\/\/(www\.)?/)[2].split("/")[0];
	domain_end = domain.split(".")[domain.split(".").length-1] //.com? .org?
	
	if(domain_end == "org"){
		output = output.replaceAt(1,singledigencode[1])
	}else if(domain_end == "net"){
		output = output.replaceAt(1,singledigencode[2])
	}else if(domain_end == "lol"){
		output = output.replaceAt(1,singledigencode[3])
	}else if(domain_end == "xyz"){
		output = output.replaceAt(1,singledigencode[4])
	}else if(domain_end == "gov"){
		output = output.replaceAt(1,singledigencode[5])
	}else if(domain_end == "gallery"){
		output = output.replaceAt(1,singledigencode[6])
	}else if(domain_end != "com"){
		output = output.replaceAt(1,singledigencode[singledigencode.length-1])
	}


	if (modifiable.match(/(&|\?)f((ormat)?)\=\w+$/)){
		modifiable = modifiable.replace(/f((ormat)?)\=(?=(\w+)$)/,"format=.");
		// if it is formated into a filetype, add a period to it to make it end with a filetype
		// later considered when using file
	}

	switch (true) {
		case /\.jpg$/.test(modifiable):
			output = output.replaceAt(2,"1");
			break;

		case /\.png$/.test(modifiable):
			output = output.replaceAt(2,"2");
			break;

		case /\.webp$/.test(modifiable):
			output = output.replaceAt(2,"3");
			break;

		case /\.pdf$/.test(modifiable):
			output = output.replaceAt(2,"4");
			break;

		case /\.txt$/.test(modifiable):
			output = output.replaceAt(2,"5");
			break;

		case /\.avif$/.test(modifiable):
			output = output.replaceAt(2,"6");
			break;

		default:
			output = output.replaceAt(2,"0")
			break;
	}

	
	const subpage_split = modifiable.split(domain+"/")[1].split("/");
	const subpage_count = subpage_split.length;
	output = output.replaceAt(3,singledigencode[subpage_count])
	
	let remaining = hyperlink.split(domain)[1];
	remaining = remaining.replace(/\&/g,"%26")

	// Common domain links
	if (output[1] != singledigencode[singledigencode.length-1]){
		domain = domain.replace("."+domain_end,".");
	}
	domain = domain.replace(/s3\.amazonaws\./g,"&aw");
	domain = domain.replace(/static\.wikia\.nocookie\./g,"&nck");
	domain = domain.replace(/preview\./g,"&p");
	domain = domain.replace(/cdn\./g,"&d");
	domain = domain.replace(/media\./g,"&m");
	domain = domain.replace(/static\./g,"&s");
	domain = domain.replace(/img\./g,"&i");
	domain = domain.replace(/wiki\./g,"&w");
	
	output += domain;

	//common sub pages
	remaining = remaining.replace(/assets\//,"&A");
	remaining = remaining.replace(/media\//,"&M");
	remaining = remaining.replace(/content\//,"&C");
	remaining = remaining.replace(/img\//,"&I");
	remaining = remaining.replace(/images\//,"&Is");
	remaining = remaining.replace(/blog\//,"&B");

	remaining = remaining.replace(/s3\.amazonaws\./g,"&aw");
	remaining = remaining.replace(/static\.wikia\.nocookie\./g,"&nck");
	remaining = remaining.replace(/preview\./g,"&p");
	remaining = remaining.replace(/cdn\./g,"&d");
	remaining = remaining.replace(/media\./g,"&m");
	remaining = remaining.replace(/static\./g,"&s");
	remaining = remaining.replace(/img\./g,"&i");
	remaining = remaining.replace(/wiki\./g,"&w");


	for (var sub = 0; sub < subpage_count; sub++){
		current_check = subpage_split[sub];
		// if the first index of the current subpage is less than where we currently are, it's a duplicate, and can be shortened.
		// but only do if the page length is longer than 7 because thats the length of the reference code
		if(subpage_split.indexOf(current_check) < sub && subpage_split.indexOf(current_check) >= 0 && current_check.length > 7){ 
			//console.log("PASSED VIBE CHECK: ",current_check)
			//console.log(remaining)
			let first_app = remaining.indexOf(current_check);
			let rep_length = current_check.length;
			
			// Reference is always 5 digits. first 3 are the index of the first appearance, the last 2 are the length of the repeated string
			let reference_text = "&r"+String(first_app).padStart(3,"0")+String(rep_length).padStart(2,"0");
			//debug(remaining)
			//debug(current_check)
			remaining = replaceAllExceptFirst(remaining,current_check,reference_text)

			//console.log(remaining.replace(targeting,`&Rf${first_app},${rep_length}`));
			break;
		}
	}
	
	remaining = remaining.replace(/\~/g,"&~");
	/*
	matching = new RegExp(filetype_ref[output[2]].replace(".",""),"g") // replace every instance of the file type with &v
	if (filetype_ref[output[2]] != ""){
		remaining = remaining.replace(matching,"&v");
	}*/
	remaining = remaining.replace(/jpg/g,"&v"+filetype_ref.indexOf("jpg"))
	remaining = remaining.replace(/png/g,"&v"+filetype_ref.indexOf("png"))
	remaining = remaining.replace(/webp/g,"&v"+filetype_ref.indexOf("webp"))
	remaining = remaining.replace(/pdf/g,"&v"+filetype_ref.indexOf("pdf"))
	remaining = remaining.replace(/txt/g,"&v"+filetype_ref.indexOf("txt"))
	remaining = remaining.replace(/avif/g,"&v"+filetype_ref.indexOf("avif"))

	remaining = remaining.replace(/(\%26|\?)width\=/,"&O");
	remaining = remaining.replace(/(\%26|\?)height\=/,"&o");
	remaining = remaining.replace(/(\%26|\?)crop\=/,"&c");
	remaining = remaining.replace(/(\%26|\?)format\=(jpg|png|webp|avif)/,"&F");
	remaining = remaining.replace(/(\%26|\?)f\=(jpg|png|webp|avif)/,"&f");
	remaining = remaining.replace(/\/(?!\&r)/g,"~");
	remaining = remaining.replace(/\/(?=\&r)/g,"");

	output += remaining
	return output;
}





function HLDecompress(text){
	text = text.replace("~","/"); // only the first instance
	let reconstruction = prefix_ref[text[0]];
	if (text[1] != singledigencode[singledigencode.length-1]){
		reconstruction += text.substring(4).split("/")[0]+domain_ref[text[1]]
	}else{
		reconstruction += text.substring(4).split("/")[0]
	}

	reconstruction = reconstruction.replace(/&nck/gi,"static.wikia.nocookie.");
	reconstruction = reconstruction.replace(/&aw/gi,"s3.amazonaws.");
	reconstruction = reconstruction.replace(/&p/gi,"preview.");
	reconstruction = reconstruction.replace(/&s/gi,"static.");
	reconstruction = reconstruction.replace(/&m/gi,"media.");
	reconstruction = reconstruction.replace(/&i/gi,"img.");
	reconstruction = reconstruction.replace(/&d/gi,"cdn.");
	reconstruction = reconstruction.replace(/&w/gi,"wiki.");

	if (text.indexOf("&r") > 0){
		const references = text.split("&r");
		for(let i = 1; i < references.length; i++){
			let f_location = references[i].slice(0,3);
			let og_length = references[i].slice(3,5);

			let original_src = text.split("/")[1].slice(parseInt(f_location-1), parseInt(og_length));
			//console.log(original_src)

			text = text.replace(new RegExp(`&r${references[i].slice(0,5)}`,'g'), "~"+original_src)
		}
	}

	while(text.indexOf("&v") > -1){
		const plusind = text.indexOf("&v")+2
		const textind = text[plusind]
		text = text.replace(/\&v\d/,filetype_ref[textind])
	}
	//text = text.replace(/&v/gi,filetype_ref[text[2]].replace(".",""))
	reconstruction = reconstruction.replace(/\.\./g,".")

	let remaining_text = "/"+text.substring(4).split("/")[1];
	/*if (Number(text[0]) > 1){
		remaining_text = baseURLDecode(remaining_text);
	}*/
	remaining_text = remaining_text.replace(/(?<!&)~/g,"/"); //now do the rest of the commas globally (if the're not genuine squiggles) the above function would've messed it up otherwise


	remaining_text = remaining_text.replace(/&~/g,"~");

	// common sub pages
	remaining_text = remaining_text.replace(/&A/g,"assets/");
	remaining_text = remaining_text.replace(/&M/g,"media/");
	remaining_text = remaining_text.replace(/&C/g,"content/");
	remaining_text = remaining_text.replace(/&Is/g,"images/");
	remaining_text = remaining_text.replace(/&I/g,"img/");
	remaining_text = remaining_text.replace(/&B/g,"blog/");

	// extra data
	remaining_text = remaining_text.replace("&F","&format=");
	remaining_text = remaining_text.replace("&O","&width=");
	remaining_text = remaining_text.replace("&o","&height=");
	remaining_text = remaining_text.replace("&c","&crop=");

	remaining_text = remaining_text.replace("&","?")
	remaining_text = remaining_text.replace(/\%26/g,"&")

	// fancy info
	if (text[2] != "0"){
		// If the text already has a period at the end, don't use one when adding file type
		let filetype = filetype_ref[text[2]];
		if (!remaining_text.endsWith("."+filetype)){
			if (!remaining_text.endsWith(".") && !remaining_text.endsWith("format=")){
				filetype = "."+filetype
			}
			remaining_text = remaining_text+filetype;
		}
	}


	return reconstruction + remaining_text;
}
