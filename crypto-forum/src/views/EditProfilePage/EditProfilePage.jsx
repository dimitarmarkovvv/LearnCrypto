import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Field, Heading, Input, NativeSelect, Stack, Textarea } from '@chakra-ui/react';
import { toaster } from '../../components/ui/toast-store.js';
import { useAuth } from '../../hooks/useAuth.js';
import { updateProfile, uploadAvatar } from '../../services/profiles.js';
import './EditProfilePage.css';

function EditProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(profile.first_name ?? '');
    const [lastName, setLastName] = useState(profile.last_name ?? '');
    const [location, setLocation] = useState(profile.location ?? '');
    const [signature, setSignature] = useState(profile.signature ?? '');
    const [gender, setGender] = useState(profile.gender ?? '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            if (avatarFile) {
                await uploadAvatar(user.id, avatarFile, profile.avatar_url);
            }

            await updateProfile(user.id, {
                first_name: firstName,
                last_name: lastName,
                location,
                signature,
                gender,
            });

            await refreshProfile();

            navigate('/posts');
        } catch (error) {
            toaster.create({ title: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="edit-profile-page">
            <Heading className="edit-profile-page__heading">Edit Profile</Heading>

            <form onSubmit={handleSubmit}>
                <Stack className="edit-profile-page__form">
                    <Field.Root>
                        <Field.Label>First Name</Field.Label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Last Name</Field.Label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Location</Field.Label>
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Signature</Field.Label>
                        <Textarea value={signature} onChange={(e) => setSignature(e.target.value)} maxLength={100} />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Gender</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field value={gender} onChange={(e) => setGender(e.target.value)}>
                                <option value="">—</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Avatar</Field.Label>
                        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                    </Field.Root>

                    <Stack className="edit-profile-page__actions">
                        <Button type="submit" loading={loading} loadingText="Saving...">
                            Save changes
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            disabled={loading}
                            onClick={() => navigate(`/users/${user.id}`)}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </Container>
    );
}

export default EditProfilePage;