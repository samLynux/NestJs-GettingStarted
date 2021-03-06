import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from './models/user.entity';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { UserCreateDTO } from 'src/auth/models/user-create.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserUpdateDTO } from 'src/auth/models/user-update.dto';
import { PaginatedResult } from 'src/common/paginate-result.interface';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { HasPemission } from 'src/permission/has-permission.decorator';


@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
        private authService: AuthService
        ){

    }

    @Get() 
    @HasPemission('users')
    async all(@Query('page') page: number = 1){
        return await this.userService.paginate(page, ['role']);
    }

    @Post()
    @HasPemission('users')
    async create(@Body() body: UserCreateDTO): Promise<User>{
        const password = await bcrypt.hash('1234',12)

        const {role_id, ...data} = body;

        return this.userService.create({
            ...data,
            password,
            role: {id: role_id}
        });
    }

    @Get(':id')
    @HasPemission('users')
    async get(@Param('id') id: number){
        return this.userService.findOne({id}, ['role']);
    }

    @Put('info')
    async updateInfo(@Req() request: Request, @Body() body: UserUpdateDTO){
        const id = await this.authService.userId(request);
        await this.userService.update(id, body)

        return this.userService.findOne(id);
    }

    @Put('password')
    async updatePassword(
        @Req() request: Request, 
        @Body('password') password: string,
        @Body('password_confirm') password_confirm: string,)
    {
        if(password !== password_confirm)
        {
            throw new BadRequestException('Passwords does not match');
        }
        const id = await this.authService.userId(request);

        const hashed = await bcrypt.hash(password,12)
        await this.userService.update(id, {
            password: hashed
        });

        return this.userService.findOne(id);
    }


    @Put(':id')
    @HasPemission('users')
    async update(
        @Param('id') id : number,
        @Body() body: UserUpdateDTO

    ){

        const {role_id, ...data} = body;
        await this.userService.update(id, {
            ...data,
            role: {id: role_id}
        })

        return this.userService.findOne(id);
    }

    @Delete(':id')
    @HasPemission('users')
    async delete(@Param('id') id : number){
        return this.userService.delete(id);
    }
}
