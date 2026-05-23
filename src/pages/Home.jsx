import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  // CREATE NEW MEETING
  const createMeeting = () => {

    // GENERATE RANDOM ROOM ID
    const roomId =
      "ROOM-" +
      Math.floor(
        10000 + Math.random() * 90000
      );

    // NAVIGATE TO ROOM
    navigate(`/room/${roomId}`);
  };

  return (

    <div className="h-screen bg-[#020817] flex items-center justify-center text-white">

      <div className="bg-[#0F172A] p-10 rounded-3xl shadow-2xl text-center w-[500px]">

        <h1 className="text-5xl font-bold mb-6">

          MeetX

        </h1>

        <p className="text-gray-400 mb-10 text-lg">

          Professional Video Conference Platform

        </p>

        <button
          onClick={createMeeting}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-xl font-semibold transition duration-300 w-full"
        >

          Create New Meeting

        </button>

      </div>
    </div>
  );
}

export default Home;