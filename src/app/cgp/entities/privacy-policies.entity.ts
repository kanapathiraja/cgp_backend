import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  
  
  @Entity({ name: 'privacy_policies' })
  export class PrivacyPolicies {
   
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    id: string;
    
    @Column({ type: 'text', name: 'Content', nullable: true })
    content: string;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'published_at', nullable: true})
    publishedAt: Date;
  
    @Column({ type: 'integer', name: 'created_by', nullable: true })
    createdBy: number;
  
    @Column({ type: 'integer', name: 'updated_by', nullable: true })
    updatedBy: number;
  
    @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true})
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', nullable: true})
    updatedAt: Date;
  
  }