import { uuid } from "aws-sdk/clients/customerprofiles";
import { IsNotEmpty } from "class-validator";
import { CgpTeams } from "src/app/cgp/entities/cgp-teams.entity";
import { Users } from "src/app/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



@Entity({ name: 'conversation' })
export class Conversation { 
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @ManyToOne((type) => Users)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    users: Users;

    @ManyToOne((type) => CgpTeams)
    @JoinColumn({ name: 'team_user_id', referencedColumnName: 'id' })
    cgpTeams: CgpTeams;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', select: false })
    updatedAt: Date;

}