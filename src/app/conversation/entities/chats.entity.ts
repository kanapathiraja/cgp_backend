import { uuid } from "aws-sdk/clients/customerprofiles";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Conversation } from "./conversation.entity";

@Entity({ name: 'chats' })
export class Chats { 
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Column({ type: 'varchar', name: 'message', nullable: true })
    message: string;

    @Column({ type: 'boolean', name: 'is_read_user',  default: false })
    isReadUser: boolean;

    @Column({ type: 'boolean', name: 'is_read_team',  default: false })
    isReadTeam: boolean;

    @Column('uuid', { name: 'from_user_id'})
    fromUserId: uuid;

    @ManyToOne((type) => Conversation)
    @JoinColumn({ name: 'conversation_id', referencedColumnName: 'id' })
    conversation: Conversation;

    @Column({ type: 'timestamp', name: 'created_at'})
    createdAt: Date;

    @Column({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
}