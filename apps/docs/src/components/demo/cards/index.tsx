import { CardsActivityGoal } from "./ActivityGoal";
import { CardsCalendar } from "./Calendar";
import { CardsChat } from "./Chat";
import { CardsCookieSettings } from "./CookieSettings";
import { CardsCreateAccount } from "./CreateAccount";
import { CardsExerciseMinutes } from "./ExcerciseMinutes";
import { CardsForms } from "./Forms";
import { CardsPayments } from "./Payments";
import { CardsReportIssue } from "./ReportIssue";
import { CardsShare } from "./Share";
import { CardsStats } from "./Stats";
import { CardsTeamMembers } from "./TeamMembers";


export function Cards() {
  return (
    <div suppressHydrationWarning data-island="demo" className='md:grids-col-2 **:data-[slot=card]:shadow-none grid md:gap-4 lg:grid-cols-10 xl:grid-cols-11'>
      <div className='grid gap-4 lg:col-span-4 xl:col-span-6'>
        <CardsStats />
        <div className='grid gap-1 sm:grid-cols-[auto_1fr] md:hidden'>
          <CardsCalendar />
          <div className='pt-3 sm:pl-2 sm:pt-0 xl:pl-4'>
            <CardsActivityGoal />
          </div>
          <div className='pt-3 sm:col-span-2 xl:pt-4'>
            <CardsExerciseMinutes />
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
          <div className='flex flex-col gap-4'>
            <CardsForms />
            <CardsTeamMembers />
            <CardsCookieSettings />
          </div>
          <div className='flex flex-col gap-4'>
            <CardsCreateAccount />
            <CardsChat />
            <div className='hidden xl:block'>
              <CardsReportIssue />
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-4 lg:col-span-6 xl:col-span-5'>
        <div className='hidden gap-1 sm:grid-cols-[auto_1fr] md:grid'>
          <CardsCalendar />
          <div className='pt-3 sm:pl-2 sm:pt-0 xl:pl-3'>
            <CardsActivityGoal />
          </div>
          <div className='pt-3 sm:col-span-2 xl:pt-3'>
            <CardsExerciseMinutes />
          </div>
        </div>
        <div className='hidden md:block'>
          <CardsPayments />
        </div>
        <CardsShare />
        <div className='xl:hidden'>
          <CardsReportIssue />
        </div>
      </div>
    </div>
  )
}
