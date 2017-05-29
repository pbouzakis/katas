require 'minitest/autorun'
require "minitest/spec"

# First stab at tennis game. This is one of my first ruby scripts :)

class TennisGame
    attr_accessor :winner

    def initialize
        initial_points = Points.create
        @player_one = Player.new(:player_one, initial_points)
        @player_two = Player.new(:player_two, initial_points)
        @winner = nil
    end

    def score
        Score.new(@player_one.points, @player_two.points, advantage)
    end

    def player_one_scores
        @player_one.score_against(@player_two)
        check_if_winner(@player_one)
    end

    def player_two_scores
        @player_two.score_against(@player_one)
        check_if_winner(@player_two)
    end

    def advantage
        if @player_one.advantage?
            @player_one.name
        elsif @player_two.advantage?
            @player_two.name
        end
    end

    def over?
        @winner != nil
    end

    def check_if_winner(player)
        if player.won?
            @winner = player
        end
    end
end

Score = Struct.new(:player_one, :player_two, :advantage) do
end

class Player
    attr_accessor :name

    def initialize(name, points)
        @name = name
        @points = points
        @won = false
        @advantage = false
    end

    def points
        @points.value
    end

    def score_against(opponent)
        if breakpoint(opponent)
            @won = true
        elsif deuce(opponent)
            if opponent.advantage?
                opponent.advantage_lost
            else
                @advantage = true
            end
        else
            @points = @points.next_point
        end
    end

    def advantage_lost
        @advantage = false
    end

    def deuce(opponent)
        points == Points::FORTY && opponent.points == Points::FORTY
    end

    def breakpoint(opponent)
        points == Points::FORTY && (opponent.points < Points::FORTY || @advantage)
    end

    def won?
        @won
    end

    def advantage?
        @advantage
    end
end

class Points
    attr_accessor :value, :next_point

    LOVE = 0
    FIFTEEN = 15
    THIRTY = 30
    FORTY = 40

    def initialize(value, next_point)
        @value = value
        @next_point = next_point
    end

    def self.create
        Points.new(Points::LOVE,
            Points.new(Points::FIFTEEN,
                Points.new(Points::THIRTY,
                    Points.new(Points::FORTY, nil))))
    end
end

describe TennisGame do
    before do
        @game = TennisGame.new
    end

    describe "when the game starts" do
        it "has both players at LOVE" do
            @game.score.must_equal Score.new(Points::LOVE, Points::LOVE)
        end
    end

    describe "when player one scores first" do
        before do
            @game.player_one_scores
        end

        it "has the score set to FIFTEEN LOVE" do
            @game.score.must_equal Score.new(Points::FIFTEEN, Points::LOVE)
        end
    end

    describe "when player two scores first" do
        before do
            @game.player_two_scores
        end

        it "has the score set to LOVE FIFTEEN" do
            @game.score.must_equal Score.new(Points::LOVE, Points::FIFTEEN)
        end
    end

    describe "when a player scores the first 2 times " do
        before do
            @game.player_one_scores
            @game.player_one_scores
        end

        it "has the score set to THIRTY LOVE" do
            @game.score.must_equal Score.new(Points::THIRTY, Points::LOVE)
        end
    end

    describe "when a player scores the first 3 times " do
        before do
            @game.player_one_scores
            @game.player_one_scores
            @game.player_one_scores
        end

        it "has the score set to THIRTY LOVE" do
            @game.score.must_equal Score.new(Points::FORTY, Points::LOVE)
        end
    end

    describe "when player one scores the first 4 times " do
        before do
            @game.player_one_scores
            @game.player_one_scores
            @game.player_one_scores
            @game.player_one_scores
        end

        it "has the game over" do
            @game.over?.must_equal true
        end

        it "has the player one as the winner" do
            @game.winner.name.must_equal :player_one
        end
    end

    describe "when a player two scores the first 4 times " do
        before do
            @game.player_two_scores
            @game.player_two_scores
            @game.player_two_scores
            @game.player_two_scores
        end

        it "has the game over" do
            @game.over?.must_equal true
        end

        it "has the player one as the winner" do
            @game.winner.name.must_equal :player_two
        end
    end

    describe "when each player score 3 times" do
        before do
            @game.player_one_scores
            @game.player_two_scores
            @game.player_one_scores
            @game.player_two_scores
            @game.player_one_scores
            @game.player_two_scores
        end

        it "has reports the score FORTY to FORTY" do
            @game.score.must_equal Score.new(Points::FORTY, Points::FORTY)
        end

        describe "when player one scores" do
            before do
                @game.player_one_scores
            end

            it "reports the game is not over" do
                @game.over?.must_equal false
            end

            it "still reports the score FORTY to FORTY with advantage player_one" do
                @game.score.must_equal Score.new(Points::FORTY, Points::FORTY, :player_one)
            end

            describe "when player one scores again" do
                before do
                    @game.player_one_scores
                end

                it "reports the game over" do
                    @game.over?.must_equal true
                end
            end

            describe "when player two scores" do
                before do
                    @game.player_two_scores
                end

                it "reports the game over NOT over" do
                    @game.over?.must_equal false
                end

                it "still reports the score back to FORTY to FORTY with no advantage" do
                    @game.score.must_equal Score.new(Points::FORTY, Points::FORTY)
                end

                describe "when player one scores again" do
                    before do
                        @game.player_one_scores
                    end

                    it "still reports the score FORTY to FORTY with advantage player_one" do
                        @game.score.must_equal Score.new(Points::FORTY, Points::FORTY, :player_one)
                    end
                end

                describe "when player two scores again" do
                    before do
                        @game.player_two_scores
                    end

                    it "still reports the score FORTY to FORTY with advantage player_one" do
                        @game.score.must_equal Score.new(Points::FORTY, Points::FORTY, :player_two)
                    end
                end
            end
        end
    end
end
