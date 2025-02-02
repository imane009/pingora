import { useEffect, useState } from "react";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";


const EditProfileModal = ({ authUser }) => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		bio: "",
		link: "",
		newPassword: "",
		currentPassword: "",
	});

	const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

	const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};


	const handlePasswordUpdate = async () => {
		if (!formData.currentPassword || !formData.newPassword) {
			setError("Current and new passwords are required.");
			return;
		}

		const auth = getAuth();
		const user = auth.currentUser;

		try {
			// Re-authenticate the user
			const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
			await reauthenticateWithCredential(user, credential);

			// Update the password
			await updatePassword(user, formData.newPassword);
			setSuccess(true);
			setError(null);
		} catch (err) {
			console.error(err);
			setError("Failed to update password. Check your current password and try again.");
		}
	};


	useEffect(() => {
		if (authUser) {
			setFormData({
				firstName: authUser.firstName,
				lastName: authUser.lastName,
				username: authUser.username,
				email: authUser.email,
				bio: authUser.bio,
				link: authUser.link,
				newPassword: "",
				currentPassword: "",
			});
		}
	}, [authUser]);

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal'>
				<div className='modal-box border rounded-md border-gray-700 shadow-md'>
					<h3 className='font-bold text-lg my-3'>Update Profile</h3>
					<form
  className="flex flex-col gap-4"
  onSubmit={async (e) => {
    e.preventDefault();

    const { newPassword, currentPassword, ...profileData } = formData;

    let passwordUpdated = false;
    let profileUpdated = false;

    try {
      // Mise à jour du mot de passe
      if (newPassword && currentPassword) {
        await handlePasswordUpdate();
        passwordUpdated = true;
      }

      // Mise à jour des autres données
      const hasProfileDataChanged = Object.keys(profileData).some(
        (key) => profileData[key] !== authUser[key]
      );

      if (hasProfileDataChanged) {
        await updateProfile(profileData);
        profileUpdated = true;
      }

      // Gestion des messages de succès
      if (passwordUpdated && profileUpdated) {
        setSuccess("Password and profile updated successfully!");
      } else if (passwordUpdated) {
        setSuccess("Password updated successfully!");
      } else if (profileUpdated) {
        setSuccess("Profile updated successfully!");
      } else {
        setError("No changes were made.");
      }
    } catch (err) {
      setError("An error occurred during the update process.");
      console.error(err);
    }
  }}
>

						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='First Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.firstName}
								name='firstName'
								onChange={handleInputChange}
							/>
							<input
								type='text'
								placeholder='Last Name'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.lastName}
								name='lastName'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							
							<textarea
								placeholder='Bio'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.bio}
								name='bio'
								onChange={handleInputChange}
							/>
						</div>
						<div className='flex flex-wrap gap-2'>
							<input
								type='password'
								placeholder='Current Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.currentPassword}
								name='currentPassword'
								onChange={handleInputChange}
							/>
							<input
								type='password'
								placeholder='New Password'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.newPassword}
								name='newPassword'
								onChange={handleInputChange}
							/>
						</div>
						<input
							type='text'
							placeholder='Link'
							className='flex-1 input border border-gray-700 rounded p-2 input-md'
							value={formData.link}
							name='link'
							onChange={handleInputChange}
						/>

                        {error && <p className="text-red-500">{error}</p>}
						{success && <p className="text-green-500">Password updated successfully!</p>}
						

						<button className='btn btn-primary rounded-full btn-sm text-white'>
							{isUpdatingProfile ? "Updating..." : "Update"}
						</button>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};
export default EditProfileModal;
