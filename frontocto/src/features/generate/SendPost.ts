import { GenerationResponse } from "@/entities/AIimage";

export async function sendGeneratePost(prompt: string, nprompt: string, inp_width: number, inp_height: number, steps: number, cfg_scale: number, setError: React.Dispatch<React.SetStateAction<string>>) {
    const genHost = process.env.NEXT_PUBLIC_GEN_API;
    
    return new Promise<GenerationResponse>(async (base) => {
        if ((prompt == "") || (undefined) || (!prompt)) {
            prompt = //"1girl, skinny, keqing \\(genshin impact\\),(ame929:0.56),(anna (drw01):0.4),(mignon:0.8),(amashiro natsuki:0.8),(dokuro deluxe:0.5),
            // (ningen mame:0.6),(hiten (hitenkei):0.6),(atdan:0.5),<lora:USNR STYLE_XL_loha:0.4>,<lora:GENESIS_MK0.2:0.6>,<lora:rafaelaaa:0.3>,<lora:745cmSDXLvpred75S:0.4>, 
            // sweater, black sailor, black skirt, pantyhose, sipmple background, purple background, black shirt, monochrome, manga style, portrait, upper body, text,,
            // (((absurdres,masterpiece,best quality))),amazing quality,very aesthetic,high definition,";
            /* "1girl,fu xuan \(honkai: star rail\),(ame929:0.56),(anna \(drw01\):0.4),"+
            "(mignon:0.8),(amashiro natsuki:0.8),(dokuro deluxe:0.5),(ningen mame:0.6),(hiten \(hitenkei\):0.6),"+
            "(atdan:0.5),<lora:USNR STYLE_XL_loha:0.4>,<lora:GENESIS_MK0.2:0.6>,<lora:rafaelaaa:0.3>,<lora:745cmSDXLvpred75S:0.4>,"+
            "front view,side view,looking at viewer,hoodie,(((absurdres,masterpiece,best quality))),amazing quality,very aesthetic,high definition,";*/
            "1girl,nachoneko,<lora:745cmSDXLvpred75S:0.8>,<lora:Nyaliaversion5:0.8>,(ame929:0.8),(anna \(drw01\):0.8),(mignon:0.8),(amashiro natsuki:0.7),"+
            "(dokuro deluxe:0.7),(ningen mame:0.7),(hiten \(hitenkei\):0.7),(atdan:0.7),looking at viewer,bedroom,sitting,on bed,cowboy shot,upper body,hoodie,"+
            "hugging own legs,very awa,masterpiece,best quality,year 2024,newest,highres,absurdres,best quality,amazing quality,very aesthetic,absurdres,"
        }
        if ((nprompt == "") || (undefined) || (!nprompt)) {
            nprompt = "(low quality, worst quality:1.2),(bad anatomy:1.1),(inaccurate limb:1.1),bad composition,inaccurate eyes,extra digit,fewer digits,extra arms,(high contrast:1.2), ((nsfw)),"
        }
        const req = JSON.stringify(
            {
                "prompt": prompt,
                "negative_prompt": nprompt,
                "seed": -1,
                "sampler_name": "Euler a",
                "scheduler": "Automatic",
                "steps": steps,
                "cfg_scale": cfg_scale,
                "width": inp_width,
                "height": inp_height
            });
        try {
            const response = await fetch(genHost + '/sdapi/v1/txt2img', {//'/generate', {//'/sdapi/v1/txt2img', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: req,
            });

            const gen_response: GenerationResponse = await response.json();

            const buffer = Buffer.from(gen_response.images[0], "base64")
            const file = new File([buffer], Date.now().toString()+".png", { type: "image/png"})

            const new_genres: GenerationResponse = { bufferImage: file, images: gen_response.images, parameters: gen_response.parameters, info: gen_response.info }
            base(new_genres);
        } catch (err) {
            setError('An error occurred.'+err);
        }
    })
}