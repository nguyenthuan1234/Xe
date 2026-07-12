import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category, CategoryDocument, CategoryGroup } from "./schemas/category.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async findAll(group?: CategoryGroup) {
    const filter = group ? { group } : {};
    return this.categoryModel.find(filter).sort({ name: 1 }).exec();
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({ group: dto.group, name: dto.name }).exec();
    if (existing) throw new BadRequestException("Danh mục này đã tồn tại.");
    const created = new this.categoryModel(dto);
    return created.save();
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!category) throw new NotFoundException("Không tìm thấy danh mục.");
    return category;
  }

  async remove(id: string) {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Không tìm thấy danh mục.");
    return { message: "Đã xóa danh mục." };
  }
}
