import Image from "next/image";
import image1 from "@/public/about-1.jpg";
import image2 from "@/public/about-2.jpg";
import { getCabins } from "../_lib/data-service";

export const revalidate = 86400;

export const metadata = {
  title: "About",
};

export default async function Page() {
  const cabins = await getCabins();

  return (
    <div className="grid grid-cols-5 gap-x-24 gap-y-32 text-lg items-center">
      <div className="col-span-3">
        <h1 className="text-4xl mb-10 text-accent-400 font-medium">
          Welcome to Yizhen
        </h1>

        <div className="space-y-8">
          <p>
            &ldquo;Yizhen&rdquo; means <em>one pillow</em> &mdash; because one
            good night&apos;s sleep is all we promise, and we take that promise
            seriously. Our retreat sits quietly in the mountains, far from the
            noise of the city.
          </p>
          <p>
            We have {cabins.length} cabins, each with its own view, its own
            character and its own silence. Some face the pines, some face the
            creek, some face nothing but open sky. All of them are built with
            local timber and warmed by a real fire.
          </p>
          <p>
            There is no lobby, no queue and no schedule here. Walk in the
            forest, read on the deck, watch the stars come out. Slow down, and
            let the mountains do the rest.
          </p>
        </div>
      </div>

      <div className="col-span-2">
        <Image
          src={image1}
          alt="Family sitting around a fire pit in front of a cabin"
          placeholder="blur"
          quality={80}
        />
      </div>

      <div className="relative aspect-square col-span-2">
        <Image
          src={image2}
          fill
          className="object-cover"
          alt="The family that runs Yizhen"
        />
      </div>

      <div className="col-span-3">
        <h1 className="text-4xl mb-10 text-accent-400 font-medium">
          Run by one family, not a company
        </h1>

        <div className="space-y-8">
          <p>
            Yizhen started as a single cabin built by our grandparents, mostly
            so the family had somewhere to gather each winter. Guests kept
            asking to stay, so we built a few more. We are still the same people
            who light the fires and cook the breakfast.
          </p>
          <p>
            Because we are small, we can afford to care about details: the
            blanket you will actually want, the trail that is worth the walk,
            the breakfast that is worth getting up for. You are not a booking
            number here &mdash; you are the reason we keep the lights on.
          </p>

          <div>
            <a
              href="/cabins"
              className="inline-block mt-4 bg-accent-500 px-8 py-5 text-primary-800 text-lg font-semibold hover:bg-accent-600 transition-all"
            >
              Explore our cabins
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
