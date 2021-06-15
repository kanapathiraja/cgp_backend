import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CgpArticles } from './cgp_articles.entity';
import { Specialties } from './specialties.entity';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'cgp_articles_specialities' })
export class CgpArticlesSpecialities {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @IsNotEmpty()
  @Column({ type: 'boolean', name: 'status', default: 1 })
  status: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    select: false,
    nullable: true,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    select: false,
    nullable: true,
  })
  updatedAt: Date;

  @ManyToOne(
    (type) => CgpArticles,
    (cgpArticles) => cgpArticles.cgpArticlesSpecialities,
  )
  @JoinColumn({ name: 'article_id', referencedColumnName: 'id' })
  cgpArticles: CgpArticles;

  @ManyToOne(
    (type) => Specialties,
    (specialties) => specialties.cgpArticlesSpecialities,
  )
  @JoinColumn({ name: 'specialty_id', referencedColumnName: 'id' })
  specialties: Specialties;
}
