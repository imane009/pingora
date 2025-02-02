import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Whotofollow = () => {
  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch authenticated user");
      return res.json();
    },
  });

  const { follow, isPending } = useFollow();

  const { data: suggestedUsers, isLoading: suggestedLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/users/suggested");
      if (!res.ok) throw new Error("Failed to fetch suggested users");
      return res.json();
    },
  });

  if (authLoading || suggestedLoading) {
    return (
      <div className="flex justify-center mt-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] lg:max-w-[800px] mx-auto p-4 mt-20">
      <h3 className="text-2xl font-bold mb-6 ">Suggestions</h3>
      <div className="flex flex-col gap-4">
        {suggestedUsers?.map((user) => (
          <Link
            to={`/profile/${user.username}`}
            key={user._id}
            className="flex items-center justify-between gap-4 hover:bg-[#D0D7E1] p-3 rounded-lg transition-colors duration-200"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={user.profileImg || "/avatar-placeholder.png"}
                  alt={`${user.fullName}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-gray-800 truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-sm text-gray-600 truncate">
                  @{user.username}
                </span>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-[#001E36] text-white font-medium rounded-full hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                follow(user._id);
              }}
            >
              {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Whotofollow;