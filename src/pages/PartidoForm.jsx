import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Alert, Row, Col, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { createPartido, updatePartido, getPartidoById } from '../services/partidoService'; 
import { getEquipos } from '../services/equipoService';

const TeamAutocompleteField = ({ type, form, setForm, allTeams }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    const nameKey = `nombreEquipo${type}`;
    const idKey = `idEquipo${type}Asociado`;
    const opponentId = form[`idEquipo${type === 'Local' ? 'Visitante' : 'Local'}Asociado`];

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleNameChange = (e) => {
        const query = e.target.value;
        setForm(prev => ({
            ...prev,
            [nameKey]: query,
            [idKey]: null
        }));

        if (query.length > 0) {
            const filteredTeams = allTeams.filter(team =>
                team.nombre.toLowerCase().includes(query.toLowerCase()) && team.idEquipo !== opponentId
            );
            setSuggestions(filteredTeams);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (team) => {
        setForm(prev => ({
            ...prev,
            [nameKey]: `${team.nombre} (${team.temporada})`,
            [idKey]: team.idEquipo
        }));
        setShowSuggestions(false);
    };

    return (
        <Form.Group ref={wrapperRef}>
            <Form.Label className="fw-bold">{`Equipo ${type}`}</Form.Label>
            <Form.Control
                type="text"
                placeholder="Buscar o escribir nombre..."
                value={form[nameKey]}
                onChange={handleNameChange}
                onFocus={() => handleNameChange({ target: { value: form[nameKey] } })}
                required
                autoComplete="off"
                style={{ borderRadius: '8px' }}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ListGroup className="position-absolute" style={{ zIndex: 1000, width: '95%' }}>
                    {suggestions.map(team => (
                        <ListGroup.Item
                            key={team.idEquipo}
                            action
                            onClick={() => handleSuggestionClick(team)}
                        >
                            {team.nombre} ({team.temporada})
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
            {form[idKey] && <span className="d-inline-block mt-1 badge bg-success">🔗 Enlazado</span>}
        </Form.Group>
    );
};


const PartidoForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        nombreEquipoLocal: '',
        nombreEquipoVisitante: '',
        idEquipoLocalAsociado: null,
        idEquipoVisitanteAsociado: null,
        fecha: new Date().toISOString().split('T')[0],
        resultado: '',
        competicion: ''
    });

    const [equiposDisponibles, setEquiposDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const equiposRes = await getEquipos();
                setEquiposDisponibles(equiposRes || []); 

                if (isEdit) {
                    const partidoRes = await getPartidoById(id);
                    const p = partidoRes.data;
                    setForm({
                        nombreEquipoLocal: p.nombreEquipoLocal,
                        nombreEquipoVisitante: p.nombreEquipoVisitante,
                        idEquipoLocalAsociado: p.idEquipoLocalAsociado || null,
                        idEquipoVisitanteAsociado: p.idEquipoVisitanteAsociado || null,
                        fecha: p.fecha.split('T')[0],
                        resultado: p.resultado || '',
                        competicion: p.competicion || ''
                    });
                }
            } catch (err) {
                setError('Error cargando datos del formulario');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.nombreEquipoLocal.trim() || !form.nombreEquipoVisitante.trim()) {
            setError('El nombre del equipo local y visitante no pueden estar vacíos.');
            return;
        }
        if (form.idEquipoLocalAsociado && form.idEquipoLocalAsociado === form.idEquipoVisitanteAsociado) {
            setError('Un equipo no puede jugar contra sí mismo.');
            return;
        }

        try {
            const payload = {
                ...form,
                idEquipoLocalAsociado: form.idEquipoLocalAsociado || null,
                idEquipoVisitanteAsociado: form.idEquipoVisitanteAsociado || null,
            };

            if (isEdit) {
                await updatePartido(id, payload);
                setSuccess('Partido actualizado correctamente');
            } else {
                await createPartido(payload);
                navigate('/partidos');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error guardando el partido');
        }
    };
    
    const handleSimpleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({...prev, [name]: value}));
    }

    if (loading) return <Container className="text-center mt-5"><Spinner /></Container>;

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-center" style={{ color: '#780000' }}>
                {isEdit ? 'Editar Partido' : 'Registrar Partido'}
            </h2>
            <div className="p-4" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                        <Col md={6}><TeamAutocompleteField type="Local" form={form} setForm={setForm} allTeams={equiposDisponibles} /></Col>
                        <Col md={6}><TeamAutocompleteField type="Visitante" form={form} setForm={setForm} allTeams={equiposDisponibles} /></Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control type="date" name="fecha" value={form.fecha} onChange={handleSimpleChange} required style={{ borderRadius: '8px' }} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Competición</Form.Label>
                                <Form.Control type="text" name="competicion" placeholder="(Opcional)" value={form.competicion} onChange={handleSimpleChange} style={{ borderRadius: '8px' }} />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Resultado</Form.Label>
                                <Form.Control type="text" name="resultado" placeholder="Ej: 25-30 (Opcional)" value={form.resultado} onChange={handleSimpleChange} style={{ borderRadius: '8px' }} />
                            </Form.Group>
                        </Col>
                    </Row>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <div className="d-flex justify-content-end gap-3 mt-4">
                        <Button variant="secondary" onClick={() => navigate('/partidos')}>Cancelar</Button>
                        <Button type="submit" style={{ backgroundColor: '#669bbc', border: 'none' }}>{isEdit ? 'Actualizar Partido' : 'Guardar Partido'}</Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default PartidoForm;