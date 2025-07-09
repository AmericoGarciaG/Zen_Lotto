from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Game(Base):
    __tablename__ = "games"
    
    game_id = Column(Integer, primary_key=True, autoincrement=False)        # NPRODUCTO
    name = Column(String, nullable=False)
    csv_url = Column(String, nullable=False)

    # Relación con contests
    contests = relationship("Contest", back_populates="game")

class Contest(Base):
    __tablename__ = "contests"
        
    game_id = Column(Integer, ForeignKey("games.game_id"), nullable=False)  # NPRODUCTO
    id = Column(Integer, nullable=False)                                    # CONCURSO
    date = Column(Date, nullable=False)
    numbers = Column(String, nullable=False)
    prize = Column(Numeric, nullable=False)
    
    # Llave primaria compuesta
    __table_args__ = (
        PrimaryKeyConstraint('id', 'game_id'),
    )

    # Relación con games
    game = relationship("Game", back_populates="contests")
