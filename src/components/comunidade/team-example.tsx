import { GroupTeamSection } from "./GroupTeamSection";
import {diversityGroupsAsMembers} from "@/components/comunidade/groups-team-sample.ts";
// controla a parte de layout da tela
export default function TeamExamplePage() {
    return (
        <div className="flex flex-col">
            <GroupTeamSection
                title="Grupos"
                subtitle="Escolha o grupo onde você se sinta mais acolhido. A seleção personalizada ajuda a encontrar caronas inclusivas."
                members={diversityGroupsAsMembers}
                backgroundImage="https://wallpapers.com/images/hd/rio-de-janeiro-desktop-n2xm3jjlgseus1rm.jpg"
                //selectedId={selectedGroupId}
                //onSelect={selectGroup}
            />
        </div>
    );
}