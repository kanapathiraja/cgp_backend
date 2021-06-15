import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn
} from "typeorm";
import { IsNotEmpty } from 'class-validator';


@Entity({ name: 'faqs' })
export class Faqs {
 
  @PrimaryGeneratedColumn("uuid", {name: "id"})
  id: string;
  
  @IsNotEmpty()
  @Column({ type: 'text', name: 'question', nullable: true })
  question: string;

  @Column({ type: 'text', name: 'answer' })
  answer: string;

  @Column({ type: 'integer', name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ type: 'integer', name: 'updated_by', nullable: true })
  updatedBy: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true})
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true})
  updatedAt: Date;

  // 0 = INACTIVE , 1 = ACTIVE
  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'active', default: 1 })
  active: boolean;

}