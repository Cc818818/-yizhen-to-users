import SelectCountry from "@/app/_components/SelectCountry";
import UpdateProfileForm from "@/app/_components/UpdateProfileForm";
import { auth } from "@/app/_lib/auth";
import { getGuest } from "@/app/_lib/data-service";

export const metadata = {
  title: "Update profile",
};

export default async function Page() {
  const session = await auth();
  const guest = await getGuest(session.user.email);

  return (
    <div>
      <h2 className="text-2xl font-medium tracking-tight text-primary-50 mb-3">
        Update your guest profile
      </h2>

      <p className="mb-8 text-primary-300 max-w-xl">
        Providing the following information will make your check-in process
        faster and smoother. See you soon!
      </p>

      <UpdateProfileForm guest={guest}>
        <SelectCountry
          name="nationality"
          id="nationality"
          className="field"
          defaultCountry={guest.nationality}
        />
      </UpdateProfileForm>
    </div>
  );
}
