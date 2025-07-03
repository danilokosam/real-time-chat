import { MainLayout } from "../layout/MainLayout";
import { GroupCard } from "../shared/GroupCard";
import { SearchInput } from "../shared/SearchInput";
import { SendMessageInput } from "../shared/SendMessageInput";
import { UserCard } from "../shared/UserCard";
import { withUserStatus } from "../shared/withUserStatus";
export const HomePage = () => {
  const Users = withUserStatus(UserCard)
  return (
    <>
      <MainLayout>
        <main className="grid grid-cols-[30%_1fr] grid-rows-1 gap-4">
          {/* contacts section */}
          <div className="flex flex-col gap-3 h-[calc(100vh-50px)]"> 
            <SearchInput />
            <section className="bg-white h-2/3  rounded-2xl p-2 shadow-2xl gap-2 flex flex-col max-h-52 overflow-y-scroll">
                <span className="pl-1">Groups</span>
                <GroupCard/>
                <GroupCard/>
                <GroupCard/>
            </section>
            <section className="bg-white h-full rounded-2xl p-2 shadow-2xl gap-2 flex flex-col overflow-y-scroll">
                <span className="pl-1">Contacts</span>
              <Users/>
              <Users/>
              <Users/>
              <Users/>
              <Users/>
              <Users/>
              <Users/>
              <Users/>
              
              
            </section>
          </div>
          {/* chat section */}
          <div className="flex flex-col gap-4 justify-between">
            <div className="bg-white rounded-2xl p-2 shadow-sm  shadow-violet-secondary">

             <UserCard selected />
            </div>
            
            <div className="h-full bg-white rounded-2xl shadow-2xl">
              <ul></ul>
            </div>
            <SendMessageInput/>
          </div>
        </main>
      </MainLayout>
    </>
  );
};
