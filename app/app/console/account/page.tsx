function Profile() {
  return (
    <div className="md:m-6 m-2 md:space-y-4 space-y-2">
      <div className="text-2xl font-bold">Account</div>
      <div className="md:p-6 p-3 rounded-xl border-2 space-y-4 flex flex-col">
        <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col md:gap-4 gap-2">
          <div>
            <div className="font-bold">Account ID</div>
            <div>1256898-64s45d4sd-sds4</div>
          </div>
          <div>
            <div className="font-bold">Account Name</div>
            <div>Anish Araz</div>
          </div>
        </div>
        <div className="md:grid md:space-x-10 grid-cols-2 flex flex-col gap-4">
          <div>
            <div className="font-bold">Email</div>
            <div>anisharaz123@gmail.com</div>
          </div>
          <div>
            <div className="font-bold">User Name</div>
            <div>aaraz</div>
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold">Billing</div>
      <div className="space-y-4 md:p-6 p-3 rounded-xl border-2">
        <div>
          <div className="font-bold">Billing ID</div>
          <div>1256898-64s45d4sd-sds4</div>
        </div>
        <div className="flex gap-12 items-center">
          <div>
            <div className="font-bold">Month</div>
            <div>2024-Jul</div>
          </div>
          <div>
            <div className="font-bold">Cost</div>
            <div className="">$00.00</div>
          </div>
        </div>
      </div>
      {/* <div className="bg-red-600 hover:bg-red-500 cursor-pointer py-1 px-4 rounded-full w-fit text-white text-lg text-center ">
        Delete Account
      </div> */}
    </div>
  );
}

export default Profile;
