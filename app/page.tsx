import { videoToSummary, displaySummary } from "./videoToSummary";
import { revalidatePath, revalidateTag } from "next/cache";

async function page() {

    let url = ""

    async function transformUrlToSummary(data: FormData) {
        "use server"
        const urlstring = data.get("url")?.toString()
        urlstring && await videoToSummary(urlstring)
        revalidatePath('/')
    }

    return (
        <main className="flex flex-col items-center h-screen">
            <header className=" p-4 text-white shadow-lg mt-10 mb-5">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-4xl font-serif">Summerize Youtube videos with AI </h1>
                </div>
            </header>
            <form className="flex items-center mb-8 justify-center" action={transformUrlToSummary}>
                <input
                    type="text"
                    placeholder="Add a video url here"
                    name="url"
                    className="mb-4 p-2 border rounded-md"
                    defaultValue={url}
                />
                <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 mb-3.5 ml-5">Transform it!</button>
            </form>
            <p className={`mb-3 text-gray-500 dark:text-gray-400 text-center mt-4 w-2/3 ${displaySummary() && "border rounded-lg border-white p-4"}`}>
                {displaySummary() && displaySummary()}
            </p>
            
        </main>
    )
}

export default page
/*
<div class="flex flex-col items-center justify-center h-screen">
  <form class="flex flex-col items-center mb-8">
    <input type="text" class="mb-4 p-2 border rounded-md">
    <button type="submit" class="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">Submit</button>
  </form>
  <p class="text-2xl font-semibold">Your Text Here</p>
</div>

*/