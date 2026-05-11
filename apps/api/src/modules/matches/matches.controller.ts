import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import {
  CreateMatchDto,
  UpdateMatchDto,
  MatchQueryDto,
  MatchResponseDto,
  MatchListResponseDto,
  MatchSummaryDto,
  JoinMatchDto,
  RespondJoinRequestDto,
  SendMessageDto,
  PlayerResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo trận đấu mới (lên kèo)' })
  @ApiResponse({ status: 201, description: 'Tạo thành công', type: MatchResponseDto })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateMatchDto,
  ): Promise<MatchResponseDto> {
    return this.matchesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách trận đấu' })
  @ApiResponse({ status: 200, description: 'Danh sách trận đấu', type: MatchListResponseDto })
  async findAll(@Query() query: MatchQueryDto): Promise<MatchListResponseDto> {
    return this.matchesService.findAll(query);
  }

  @Get('my-matches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trận đấu của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách trận đấu', type: MatchListResponseDto })
  async getMyMatches(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<MatchListResponseDto> {
    return this.matchesService.findMyMatches(user.id, page, limit);
  }

  @Get('my-created')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trận đấu tôi tạo' })
  @ApiResponse({ status: 200, description: 'Danh sách trận đấu', type: MatchListResponseDto })
  async getMyCreatedMatches(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<MatchListResponseDto> {
    return this.matchesService.getMyCreatedMatches(user.id, page, limit);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê trận đấu của tôi' })
  @ApiResponse({ status: 200, description: 'Thống kê', type: MatchSummaryDto })
  async getSummary(@CurrentUser() user: CurrentUserData): Promise<MatchSummaryDto> {
    return this.matchesService.getSummary(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết trận đấu' })
  @ApiResponse({ status: 200, description: 'Thông tin trận đấu', type: MatchResponseDto })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: CurrentUserData,
  ): Promise<MatchResponseDto> {
    return this.matchesService.findOne(id, user?.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trận đấu' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateMatchDto,
  ): Promise<MatchResponseDto> {
    return this.matchesService.update(id, user.id, dto);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tham gia trận đấu' })
  @ApiResponse({ status: 200, description: 'Tham gia thành công', type: MatchResponseDto })
  @ApiResponse({ status: 400, description: 'Không thể tham gia' })
  async join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: JoinMatchDto,
  ): Promise<MatchResponseDto> {
    return this.matchesService.join(id, user.id, dto);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rời khỏi trận đấu' })
  @ApiResponse({ status: 200, description: 'Rời thành công', type: MatchResponseDto })
  async leave(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MatchResponseDto> {
    return this.matchesService.leave(id, user.id);
  }

  @Post(':id/respond/:playerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phê duyệt/từ chối yêu cầu tham gia' })
  @ApiResponse({ status: 200, description: 'Thành công', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async respondToJoin(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: RespondJoinRequestDto,
  ): Promise<MatchResponseDto> {
    return this.matchesService.respondToJoin(id, playerId, user.id, dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy trận đấu' })
  @ApiResponse({ status: 200, description: 'Hủy thành công', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body('reason') reason?: string,
  ): Promise<MatchResponseDto> {
    return this.matchesService.cancel(id, user.id, reason);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bắt đầu trận đấu' })
  @ApiResponse({ status: 200, description: 'Bắt đầu thành công', type: MatchResponseDto })
  @ApiResponse({ status: 400, description: 'Không thể bắt đầu' })
  async startMatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MatchResponseDto> {
    return this.matchesService.startMatch(id, user.id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kết thúc trận đấu' })
  @ApiResponse({ status: 200, description: 'Kết thúc thành công', type: MatchResponseDto })
  @ApiResponse({ status: 400, description: 'Không thể kết thúc' })
  async completeMatch(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MatchResponseDto> {
    return this.matchesService.completeMatch(id, user.id);
  }

  @Get(':id/players')
  @ApiOperation({ summary: 'Danh sách người chơi' })
  @ApiResponse({ status: 200, description: 'Danh sách người chơi', type: [PlayerResponseDto] })
  async getPlayers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: CurrentUserData,
  ): Promise<PlayerResponseDto[]> {
    return this.matchesService.getPlayers(id, user?.id);
  }

  @Post(':id/checkin/:playerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check-in người chơi' })
  @ApiResponse({ status: 200, description: 'Check-in thành công', type: MatchResponseDto })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async checkInPlayer(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('playerId', ParseUUIDPipe) playerId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<MatchResponseDto> {
    return this.matchesService.checkInPlayer(id, playerId, user.id);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy tin nhắn chat của trận đấu' })
  @ApiResponse({ status: 200, description: 'Danh sách tin nhắn' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<{ data: any[]; total: number }> {
    return this.matchesService.getMessages(id, user.id, page, limit);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi tin nhắn chat' })
  @ApiResponse({ status: 201, description: 'Gửi thành công' })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() dto: SendMessageDto,
  ): Promise<any> {
    return this.matchesService.sendMessage(id, user.id, dto);
  }

  @Delete(':id/messages/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  async deleteMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ message: string }> {
    return this.matchesService.deleteMessage(messageId, user.id);
  }
}
