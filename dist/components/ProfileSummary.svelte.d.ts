interface Props {
    name: string;
    email?: string;
    image?: string | null;
    imageAlt?: string;
    framed?: boolean;
}
declare const ProfileSummary: import("svelte").Component<Props, {}, "">;
type ProfileSummary = ReturnType<typeof ProfileSummary>;
export default ProfileSummary;
